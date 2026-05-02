import axios from 'axios';
import { GENRE_IDS } from '../../../data/movieIds';

const FANART_BASE = 'https://webservice.fanart.tv/v3';
const TVMAZE_BASE = 'https://api.tvmaze.com';

// Simple in-memory cache to speed up repeated requests
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export default async function handler(req, res) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug[0] : slug;
  const API_KEY = process.env.FANART_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Fanart API Key Missing' });
  }

  // Cache key based on path and query
  const cacheKey = JSON.stringify(slug);
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] ${path}`);
      return res.status(200).json(data);
    }
    cache.delete(cacheKey);
  }

  try {
    // For all "discovery" routes (trending, action, etc.)
    if (['top10', 'continue', 'trending', 'top_rated', 'popular', 'upcoming', 'action', 'comedy', 'horror', 'romance', 'scifi', 'animation', 'tvshows'].includes(path)) {
      const isTV = path === 'tvshows';
      const type = isTV ? 'tv' : 'movies';
      
      let idsToFetch = [];
      
      if (GENRE_IDS[path]) {
        idsToFetch = GENRE_IDS[path];
      } else {
        idsToFetch = GENRE_IDS.trending;
      }

      const results = await Promise.all(idsToFetch.map(async (id, index) => {
        try {
          let fetchId = id;
          let tvMazeData = null;

          // If it's a TV show, we need to map TMDB ID to TVDB ID for Fanart
          // and fetch metadata from TVMaze as a fast fallback
          if (isTV) {
            try {
              const tmRes = await axios.get(`${TVMAZE_BASE}/lookup/shows?thetmdb=${id}`);
              tvMazeData = tmRes.data;
              fetchId = tvMazeData.externals?.thetvdb || id;
            } catch (e) {
              // If TVMaze fails, we still try Fanart with the original ID (might be TVDB already)
            }
          }

          // Fetch from Fanart
          const detailRes = await axios.get(`${FANART_BASE}/${type}/${fetchId}?api_key=${API_KEY}`);
          const item = detailRes.data;

          // Prioritize images that usually have the title baked in (Thumbs and Movie Art)
          const backdrop = item.moviethumb?.[0]?.url || item.tvthumb?.[0]?.url || item.movieart?.[0]?.url || item.showart?.[0]?.url || item.moviebackground?.[0]?.url || item.showbackground?.[0]?.url || tvMazeData?.image?.original;
          const poster = item.movieposter?.[0]?.url || item.tvposter?.[0]?.url || tvMazeData?.image?.medium || tvMazeData?.image?.original;
          const logo = item.hdmovielogo?.[0]?.url || item.hdtvlogo?.[0]?.url || item.movielogo?.[0]?.url || item.clearlogo?.[0]?.url;

          // Proxy images for reliability
          const proxy = (url) => url ? `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}` : null;

          return {
            id: id,
            realId: fetchId,
            title: item.name || tvMazeData?.name || "Featured Title",
            name: item.name || tvMazeData?.name || "Featured Title",
            backdrop_path: proxy(backdrop),
            poster_path: proxy(poster),
            backdrop_url: proxy(backdrop),
            poster_url: proxy(poster),
            logo_url: proxy(logo),
            overview: tvMazeData?.summary?.replace(/<[^>]*>?/gm, '') || `High quality assets for ${item.name || 'this title'}.`,
            vote_average: tvMazeData?.rating?.average || (8.5 + (index * 0.1) % 1.5),
            media_type: isTV ? 'tv' : 'movie',
            release_date: tvMazeData?.premiered?.slice(0, 4) || '2024',
          };
        } catch (e) {
          if (id) {
             try {
               const tmRes = await axios.get(`${TVMAZE_BASE}/lookup/shows?thetmdb=${id}`);
               const show = tmRes.data;
               const proxy = (url) => url ? `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}` : null;

               return {
                 id: id,
                 title: show.name,
                 name: show.name,
                 backdrop_path: proxy(show.image?.original),
                 poster_path: proxy(show.image?.medium || show.image?.original),
                 backdrop_url: proxy(show.image?.original),
                 poster_url: proxy(show.image?.medium || show.image?.original),
                 overview: show.summary?.replace(/<[^>]*>?/gm, '') || 'No description available.',
                 vote_average: show.rating?.average || 7.5,
                 media_type: 'movie',
                 release_date: show.premiered?.slice(0, 4) || 'N/A'
               };
             } catch (innerE) { 
               return null; 
             }
          }
          return null;
        }
      }));

      const filteredResults = results.filter(item => item !== null && (item.poster_url || item.backdrop_url));
      const responseData = { 
        results: path === 'top10' ? filteredResults.slice(0, 10) : filteredResults 
      };

      // Store in cache
      cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
      
      return res.status(200).json(responseData);
    }

    // Handle Search using TVMaze (already relatively fast)
    if (path === 'search') {
      const query = slug[1];
      if (!query) return res.status(200).json({ results: [] });

      try {
        const tvMazeRes = await axios.get(`${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query)}`);
        const searchResults = tvMazeRes.data;

        const results = await Promise.all(searchResults.slice(0, 15).map(async (entry) => {
          const show = entry.show;
          const tvdbId = show.externals?.thetvdb;
          
          let artwork = {};
          if (tvdbId) {
            try {
              // Use cache for search artwork too if possible
              const artKey = `art_${tvdbId}`;
              if (cache.has(artKey)) {
                artwork = cache.get(artKey).data;
              } else {
                const faRes = await axios.get(`${FANART_BASE}/tv/${tvdbId}?api_key=${API_KEY}`);
                artwork = faRes.data;
                cache.set(artKey, { data: artwork, timestamp: Date.now() });
              }
            } catch (e) { /* ignore artwork errors */ }
          }

          const backdrop = artwork.showbackground?.[0]?.url || artwork.tvthumb?.[0]?.url || show.image?.original;
          const poster = artwork.tvposter?.[0]?.url || show.image?.medium || show.image?.original;

          return {
            id: show.id,
            title: show.name,
            name: show.name,
            backdrop_path: backdrop,
            poster_path: poster,
            backdrop_url: backdrop,
            poster_url: poster,
            overview: show.summary?.replace(/<[^>]*>?/gm, '') || 'No description available.',
            vote_average: show.rating?.average || 7.5,
            media_type: 'tv',
            release_date: show.premiered?.slice(0, 4) || 'N/A'
          };
        }));

        const responseData = { results: results.filter(r => r.backdrop_url || r.poster_url) };
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        return res.status(200).json(responseData);
      } catch (e) {
        return res.status(200).json({ results: [] });
      }
    }

    // Handle single movie/tv detail
    if (path === 'movie' || path === 'tv') {
      const id = slug[1];
      const type = path === 'movie' ? 'movies' : 'tv';
      
      try {
        const response = await axios.get(`${FANART_BASE}/${type}/${id}?api_key=${API_KEY}`);
        const item = response.data;

        let metadata = {
          summary: `Detailed artwork and assets for ${item.name}.`,
          rating: { average: 9.0 },
          genres: ['Fanart']
        };

        if (type === 'tv') {
          try {
            const tmRes = await axios.get(`${TVMAZE_BASE}/lookup/shows?thetvdb=${id}`);
            metadata = tmRes.data;
          } catch (e) {}
        }

        const backdrop = item.moviebackground?.[0]?.url || item.showbackground?.[0]?.url || item.moviethumb?.[0]?.url || item.tvthumb?.[0]?.url || item.movieart?.[0]?.url;
        const poster = item.movieposter?.[0]?.url || item.tvposter?.[0]?.url || item.moviethumb?.[0]?.url || item.tvthumb?.[0]?.url;
        const logo = item.hdmovielogo?.[0]?.url || item.hdtvlogo?.[0]?.url || item.movielogo?.[0]?.url || item.clearlogo?.[0]?.url;

        return res.status(200).json({
          id: id,
          title: item.name,
          name: item.name,
          backdrop_url: backdrop,
          poster_url: poster,
          logo_url: logo,
          overview: metadata.summary?.replace(/<[^>]*>?/gm, '') || metadata.overview,
          vote_average: metadata.rating?.average || 8.0,
          genres: metadata.genres?.map(g => ({ name: g })) || [{ name: 'Featured' }],
          credits: { cast: [{ name: 'Fanart Contributor' }] },
          videos: [],
          similar: [],
        });
      } catch (e) {
        // Fallback for details if Fanart fails
        if (type === 'tv') {
           const tmRes = await axios.get(`${TVMAZE_BASE}/lookup/shows?thetvdb=${id}`);
           const show = tmRes.data;
           return res.status(200).json({
             id: id,
             title: show.name,
             name: show.name,
             backdrop_url: show.image?.original,
             poster_url: show.image?.medium || show.image?.original,
             overview: show.summary?.replace(/<[^>]*>?/gm, '') || 'No description available.',
             vote_average: show.rating?.average || 8.0,
             genres: show.genres?.map(g => ({ name: g })) || [],
             credits: { cast: [] },
             videos: [],
             similar: []
           });
        }
        throw e;
      }
    }

    return res.status(400).json({ error: 'Unknown route' });
  } catch (err) {
    console.error('API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}


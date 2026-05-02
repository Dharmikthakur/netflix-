import axios from 'axios';
const FANART_BASE = 'https://webservice.fanart.tv/v3';
const API_KEY = process.env.FANART_API_KEY;

export default async function handler(req, res) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug[0] : slug;

  try {
    if (!API_KEY) {
      throw new Error('Fanart API Key Missing');
    }

    // For all "discovery" routes, we use the Fanart latest endpoint
    if (['trending', 'top_rated', 'popular', 'upcoming', 'action', 'comedy', 'horror', 'romance', 'scifi', 'animation', 'tvshows', 'search'].includes(path)) {
      const type = path === 'tvshows' ? 'tv' : 'movies';
      const response = await axios.get(`${FANART_BASE}/${type}/latest?api_key=${API_KEY}`);
      const faData = response.data;

      const results = Object.keys(faData).map((id) => {
        const item = faData[id];
        return {
          id: id,
          title: item.name,
          name: item.name,
          backdrop_path: item.moviebackground?.[0]?.url || item.showbackground?.[0]?.url,
          poster_path: item.movieposter?.[0]?.url || item.tvposter?.[0]?.url,
          backdrop_url: item.moviebackground?.[0]?.url || item.showbackground?.[0]?.url,
          poster_url: item.movieposter?.[0]?.url || item.tvposter?.[0]?.url,
          logo_url: item.hdmovielogo?.[0]?.url || item.hdtvlogo?.[0]?.url,
          overview: `High quality artwork for ${item.name} provided by Fanart.tv.`,
          vote_average: 8.5,
          media_type: path === 'tvshows' ? 'tv' : 'movie',
          release_date: '2024',
        };
      });

      return res.status(200).json({ results });
    }

    // Handle single movie/tv detail
    if (path === 'movie' || path === 'tv') {
      const id = slug[1];
      const type = path === 'movie' ? 'movies' : 'tv';
      const response = await axios.get(`${FANART_BASE}/${type}/${id}?api_key=${API_KEY}`);
      const item = response.data;

      return res.status(200).json({
        id: id,
        title: item.name,
        name: item.name,
        backdrop_url: item.moviebackground?.[0]?.url || item.showbackground?.[0]?.url,
        poster_url: item.movieposter?.[0]?.url || item.tvposter?.[0]?.url,
        logo_url: item.hdmovielogo?.[0]?.url || item.hdtvlogo?.[0]?.url,
        overview: `Detailed artwork and assets for ${item.name}. This content is fetched exclusively via the Fanart.tv API.`,
        vote_average: 9.0,
        genres: [{ id: 1, name: 'Fanart' }],
        credits: { cast: [{ name: 'Fanart Contributor' }] },
        videos: [], // Fanart does not provide videos
        similar: [],
      });
    }

    return res.status(400).json({ error: 'Unknown route' });
  } catch (err) {
    console.error('Fanart API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const SOURCES = [
  { id: 'vidlink', name: 'VidLink (4K)' },
  { id: 'vidsrc_to', name: 'VidSrc.to (HD)' },
  { id: 'vidking', name: 'VidKing (Fast)' },
  { id: 'multiembed', name: 'MultiEmbed (Multi)' },
];

export default function MovieDetail() {
  const router = useRouter();
  const { id, type = 'movie', s = 1, e = 1 } = router.query;
  const [movie, setMovie] = useState(null);
  const [activeSource, setActiveSource] = useState(SOURCES[0].id);
  
  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      try {
        const { data } = await axios.get(`/api/movies/${type}/${id}`);
        setMovie(data);
      } catch (e) {
        console.error('Fetch error:', e);
      }
    };
    fetchMovie();
  }, [id, type]);

  if (!movie) {
    return <div className="loader"><div className="spinner" /></div>;
  }

  const getEmbedUrl = () => {
    switch (activeSource) {
      case 'vidlink':
        return type === 'tv'
          ? `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=1`
          : `https://vidlink.pro/movie/${id}?autoplay=1`;
      case 'vidsrc_to':
        return type === 'tv'
          ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
          : `https://vidsrc.to/embed/movie/${id}`;
      case 'vidking':
        return type === 'tv'
          ? `https://www.vidking.net/embed/tv/${id}/${s}/${e}`
          : `https://www.vidking.net/embed/movie/${id}`;
      case 'multiembed':
        return type === 'tv'
          ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${id}&tmdb=1`;
      default:
        return '';
    }
  };

  return (
    <>
      <Head>
        <title>{movie.title || movie.name} - Netflix</title>
      </Head>
      <div style={{ background: '#141414', minHeight: '100vh', color: 'white' }}>
        <Navbar user={{ name: 'Guest' }} onSearch={() => {}} />
        
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 130px)', marginTop: '70px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', gap: '10px', padding: '15px 20px', background: '#000', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Source:</span>
            {SOURCES.map(source => (
              <button
                key={source.id}
                onClick={() => setActiveSource(source.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: activeSource === source.id ? '#e50914' : '#333',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
              >
                {source.name}
              </button>
            ))}
            <span style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>
              If current source is not working, try another one.
            </span>
          </div>

          <div style={{ flex: 1, position: 'relative', width: '100%' }}>
            <iframe
              src={getEmbedUrl()}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Movie Player"
            />
          </div>
        </div>
      </div>
    </>
  );
}

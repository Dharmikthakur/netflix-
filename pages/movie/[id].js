import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

export default function MovieDetail() {
  const router = useRouter();
  const { id, type = 'movie', s = 1, e = 1 } = router.query;
  const [movie, setMovie] = useState(null);
  
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

  const embedUrl = type === 'tv' 
    ? `https://vidking.net/embed/tv/${id}/${s}/${e}`
    : `https://vidking.net/embed/movie/${id}`;

  return (
    <>
      <Head>
        <title>{movie.title || movie.name} - Netflix</title>
      </Head>
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <Navbar user={{ name: 'Guest' }} onSearch={() => {}} />
        
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 70px)', marginTop: '70px' }}>
           <iframe
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Movie Player"
            />
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import styles from '../styles/Hero.module.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1574267432553-4b2026622991?q=80&w=2000&auto=format&fit=crop';

export default function Hero({ movie, onPlay, onMoreInfo }) {
  const [logoError, setLogoError] = useState(false);
  if (!movie) return null;

  const title = movie.title || movie.name || 'Featured';
  
  let backdrop = movie.backdrop_url || movie.backdrop_path || PLACEHOLDER;

  const overview = movie.overview?.length > 200
    ? movie.overview.slice(0, 200) + '...'
    : movie.overview;

  const matchPercent = movie.vote_average ? (movie.vote_average * 10).toFixed(0) : '84';
  const year = (movie.release_date || movie.first_air_date || '2024').slice(0, 4);

  return (
    <div className={styles.hero} style={{ backgroundImage: `url(${backdrop})` }}>
      <div className={styles.overlay} />
      
      <div className={styles.content}>
        {movie.logo_url && !logoError ? (
          <img 
            src={movie.logo_url} 
            alt={title} 
            className={styles.logoImg} 
            onError={() => setLogoError(true)}
          />
        ) : (
          <h1 className={styles.title}>{title}</h1>
        )}
        
        <div className={styles.meta}>
          <span className={styles.match}>{matchPercent}% Match</span>
          <span className={styles.year}>{year}</span>
          <span className={styles.hd}>HD</span>
          <span className={styles.type}>{movie.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
        </div>

        <p className={styles.overview}>{overview}</p>
        
        <div className={styles.actions}>
          <button className="btn btn-white" onClick={onPlay} id="hero-play" style={{ padding: '12px 32px' }}>
            <svg fill="black" viewBox="0 0 24 24" width="28" height="28">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span style={{ fontSize: 18 }}>Play</span>
          </button>
          <button className="btn btn-secondary" onClick={onMoreInfo} id="hero-more-info" style={{ padding: '12px 32px', background: 'rgba(109, 109, 110, 0.7)' }}>
            <svg fill="white" viewBox="0 0 24 24" width="28" height="28">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span style={{ fontSize: 18 }}>More Info</span>
          </button>
        </div>
      </div>

      <div className={styles.rightControls}>
        <button className={styles.muteBtn}>
          <svg fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24">
            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </button>
        <div className={styles.ratingBadge}>TV-MA</div>
      </div>
    </div>
  );
}

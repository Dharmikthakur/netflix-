import { useState } from 'react';
import styles from '../styles/MovieCard.module.css';

export default function MovieCard({ movie, isLargeRow, onClick, onAddToList, inList }) {
  const [imgError, setImgError] = useState(false);

  if (!movie.poster_path && !movie.backdrop_path && !movie.poster_url && !movie.backdrop_url) return null;

  let image = '';
  if (isLargeRow) {
    image = movie.poster_url || movie.poster_path || movie.backdrop_url;
  } else {
    image = movie.backdrop_url || movie.backdrop_path || movie.poster_url;
  }

  const ratingValue = movie.vote_average ? movie.vote_average.toFixed(1) : '8.5';

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToList();
  };

  const getFinalUrl = (url) => {
    if (!url) return null;
    if (url.includes('fanart.tv') && !url.includes('weserv.nl')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`;
    }
    return url;
  };

  return (
    <div className={`${styles.card} ${isLargeRow ? styles.cardLarge : ''}`} onClick={onClick}>
      <img
        src={imgError ? `https://via.placeholder.com/500x750/141414/ffffff?text=${encodeURIComponent(movie.title || movie.name)}` : getFinalUrl(image)}
        alt={movie.name || movie.title}
        className={styles.image}
        loading="lazy"
        onError={() => setImgError(true)}
      />
      {movie.badge && <div className={styles.badge}>{movie.badge}</div>}
      {movie.isNew && <div className={styles.newBadge}>NEW</div>}
      
      <div className={styles.overlay}>
        <h3 className={styles.title}>{movie.title || movie.name}</h3>
        <div className={styles.actionBar}>
          <div className={styles.actionsLeft}>
            <button className={styles.playBtn} aria-label="Play">
              <svg fill="black" viewBox="0 0 24 24" width="20" height="20">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button className={`${styles.circleBtn} ${inList ? styles.active : ''}`} onClick={handleAdd} aria-label="Add to List">
              {inList ? (
                <svg fill="white" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              ) : (
                <svg fill="white" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              )}
            </button>
          </div>
          <div className={styles.ratingBox}>
            <span className={styles.star}>★</span>
            <span className={styles.ratingText}>{ratingValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

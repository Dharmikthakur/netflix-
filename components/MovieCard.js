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

  const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) + '% Match' : null;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToList();
  };

  // Auto-proxy if the URL comes from Fanart but wasn't proxied by the API yet
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
        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            <button className={styles.circleBtn} style={{ background: '#fff' }} aria-label="Play">
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
          <button className={styles.circleBtn} aria-label="More Info">
            <svg fill="white" viewBox="0 0 24 24" width="18" height="18">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </button>
        </div>
        <div className={styles.meta}>
          <span className={styles.rating}>{rating}</span>
          <span className={styles.age}>16+</span>
        </div>
        <p className={styles.title}>{movie.title || movie.name}</p>
      </div>
    </div>
  );
}

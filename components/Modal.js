import { useRouter } from 'next/router';
import styles from '../styles/Modal.module.css';

const IMG_BASE = 'https://image.tmdb.org/t/p/original';

export default function Modal({ movie, onClose, onAddToList, myList }) {
  const router = useRouter();
  if (!movie) return null;

  const title = movie.title || movie.name;
  let backdrop = null;
  if (movie.backdrop_url) backdrop = movie.backdrop_url;
  else if (movie.backdrop_path) backdrop = `${IMG_BASE}${movie.backdrop_path}`;
  const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) + '% Match' : null;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const inList = myList?.some((m) => m.id === movie.id);
  
  // Find trailer
  const trailer = movie.videos?.find((vid) => vid.type === 'Trailer' && vid.site === 'YouTube');

  const handlePlay = () => {
    const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
    router.push(`/movie/${movie.id}?type=${type}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg fill="white" viewBox="0 0 24 24" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className={styles.hero}>
          {trailer ? (
            <div className={styles.videoWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&loop=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Trailer"
              />
            </div>
          ) : (
            backdrop && <img src={backdrop} alt={title} className={styles.backdrop} />
          )}
          <div className={styles.heroOverlay} />
          
          <div className={styles.heroContent}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.actions}>
              <button className="btn btn-white" style={{ padding: '8px 24px', fontSize: 18 }} onClick={handlePlay}>
                <svg fill="black" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </button>
              <button className={`${styles.circleBtn} ${inList ? styles.active : ''}`} onClick={() => onAddToList(movie)}>
                {inList ? (
                  <svg fill="white" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                ) : (
                  <svg fill="white" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.mainInfo}>
            <div className={styles.meta}>
              <span className={styles.rating}>{rating}</span>
              <span className={styles.year}>{year}</span>
              <span className={styles.age}>16+</span>
              {movie.runtime && <span className={styles.runtime}>{movie.runtime}m</span>}
              {movie.number_of_seasons && <span className={styles.runtime}>{movie.number_of_seasons} Seasons</span>}
            </div>
            <p className={styles.overview}>{movie.overview}</p>
          </div>
          
          <div className={styles.sideInfo}>
            {movie.credits?.cast && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Cast:</span>
                <span className={styles.value}>
                  {movie.credits.cast.slice(0, 4).map((c) => c.name).join(', ')}
                </span>
              </div>
            )}
            {movie.genres && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Genres:</span>
                <span className={styles.value}>
                  {movie.genres.map((g) => g.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {movie.similar?.length > 0 && (
          <div className={styles.similar}>
            <h3 className={styles.similarTitle}>More Like This</h3>
            <div className={styles.similarGrid}>
              {movie.similar.slice(0, 9).map((sim) => (
                <div key={sim.id} className={styles.similarCard}>
                  {sim.backdrop_url || sim.backdrop_path ? (
                    <img src={sim.backdrop_url ? sim.backdrop_url : `${IMG_BASE}${sim.backdrop_path}`} alt={sim.title || sim.name} />
                  ) : (
                    <div className={styles.noImage}>{sim.title || sim.name}</div>
                  )}
                  <div className={styles.similarInfo}>
                    <h4>{sim.title || sim.name}</h4>
                    <span className={styles.similarYear}>
                      {(sim.release_date || sim.first_air_date || '').slice(0, 4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

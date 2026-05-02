import { useRef, useState } from 'react';
import styles from '../styles/Row.module.css';
import MovieCard from './MovieCard';

export default function Row({ label, movies, isLargeRow, isTop10, onCardClick, onAddToList, myList }) {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction) => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className={styles.rowContainer}>
      <h2 className={styles.rowTitle}>{label}</h2>
      <div className={styles.wrapper}>
        <button
          className={`${styles.arrow} ${styles.arrowLeft} ${!isMoved && styles.hidden}`}
          onClick={() => handleClick('left')}
        >
          <svg fill="white" viewBox="0 0 24 24" width="32" height="32">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>

        <div className={styles.row} ref={rowRef}>
          {movies.map((movie, index) => (
            <div key={movie.id} className={isTop10 ? styles.top10Card : ''}>
              {isTop10 && <div className={styles.top10Number}>{index + 1}</div>}
              <MovieCard
                movie={movie}
                isLargeRow={isLargeRow}
                onClick={() => onCardClick(movie)}
                onAddToList={() => onAddToList(movie)}
                inList={myList.some((m) => m.id === movie.id)}
              />
            </div>
          ))}
        </div>

        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => handleClick('right')}
        >
          <svg fill="white" viewBox="0 0 24 24" width="32" height="32">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

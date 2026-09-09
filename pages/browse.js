import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Row from '../components/Row';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import styles from '../styles/Browse.module.css';

import { LIVE_CHANNELS } from '../data/liveChannels';

const ROWS = [
  { slug: 'continue', label: 'Continue Watching' },
  { slug: 'top10', label: 'Top 10 Movies Today' },
  { slug: 'trending', label: 'Trending Now' },
  { slug: 'top_rated', label: 'Top Rated' },
  { slug: 'popular', label: 'Popular on Netflix' },
  { slug: 'upcoming', label: 'Coming Soon' },
  { slug: 'action', label: 'Action & Adventure' },
  { slug: 'comedy', label: 'Comedy' },
  { slug: 'horror', label: 'Thriller & Horror' },
  { slug: 'scifi', label: 'Sci-Fi & Fantasy' },
  { slug: 'romance', label: 'Romance' },
  { slug: 'animation', label: 'Animation' },
  { slug: 'tvshows', label: 'Popular TV Shows' },
];

export default function Browse() {
  const router = useRouter();

  const [rows, setRows] = useState({});
  const [hero, setHero] = useState(null);
  const [modal, setModal] = useState(null);
  const [myList, setMyList] = useState([]);
  const [toast, setToast] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Guest' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('netflix_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {}
      }
    }

    const fetchRows = async () => {
      try {
        const rowData = await Promise.all(
          ROWS.map(async ({ slug }) => {
            try {
              const { data } = await axios.get(`/api/movies/${slug}`);
              return { slug, results: data.results || [] };
            } catch (e) {
              console.error(`Error fetching row ${slug}:`, e);
              return { slug, results: [] };
            }
          })
        );

        const newRows = {};
        const localSeenIds = new Set();
        let featuredHero = null;

        rowData.forEach(({ slug, results }) => {
          const filtered = results.filter(movie => {
            if (localSeenIds.has(movie.id)) return false;
            localSeenIds.add(movie.id);
            return true;
          });

          newRows[slug] = filtered;

          // Try to pick the hero from trending first, then any other row
          if (!featuredHero && filtered.length > 0) {
            if (slug === 'trending' || !featuredHero) {
               featuredHero = filtered.find((m) => m.backdrop_path || m.backdrop_url) || filtered[0];
               // Filter it out to prevent duplication
               newRows[slug] = filtered.filter(m => m.id !== featuredHero.id);
            }
          }
        });

        setRows(newRows);
        if (featuredHero) setHero(featuredHero);
      } catch (e) {
        console.error('Parallel row fetch error:', e);
      }
    };

    fetchRows();
    fetchMyList();
  }, []);

  const fetchMyList = async () => {
    try {
      if (typeof window !== 'undefined') {
        const localList = localStorage.getItem('netflix_mylist');
        if (localList) {
          setMyList(JSON.parse(localList));
          return;
        }
      }
      const { data } = await axios.get('/api/mylist');
      if (data?.myList) {
        setMyList(data.myList);
      }
    } catch (e) {
      // Fallback silently to empty or local list
      if (typeof window !== 'undefined') {
        const localList = localStorage.getItem('netflix_mylist');
        if (localList) setMyList(JSON.parse(localList));
      }
    }
  };

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  const handleAddToList = async (movie) => {
    const inList = myList.some((m) => m.id === movie.id);
    let updated;
    if (inList) {
      updated = myList.filter((m) => m.id !== movie.id);
      setMyList(updated);
      showToast(`Removed "${movie.title || movie.name}" from My List`);
    } else {
      updated = [...myList, movie];
      setMyList(updated);
      showToast(`Added "${movie.title || movie.name}" to My List`);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('netflix_mylist', JSON.stringify(updated));
    }

    try {
      if (inList) {
        await axios.delete('/api/mylist', { data: { id: movie.id } });
      } else {
        await axios.post('/api/mylist', {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          overview: movie.overview,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids,
          media_type: movie.media_type || 'movie',
        });
      }
    } catch (e) {
      // Handled gracefully via localStorage
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const { data } = await axios.get(`/api/movies/search/${encodeURIComponent(query)}`);
      setSearchResults(data.results?.filter((m) => m.poster_path) || []);
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const openModal = async (item) => {
    if (item.isLive || item.status === 'LIVE') {
      setModal(item);
      return;
    }
    try {
      const type = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie';
      const { data } = await axios.get(`/api/movies/${type}/${item.id}`);
      setModal(data);
    } catch (e) {
      setModal(item);
    }
  };

  return (
    <>
      <Head>
        <title>Netfix by Dharmik — Browse</title>
        <meta name="description" content="Browse thousands of movies and TV shows on Netfix by Dharmik." />
      </Head>

      <div className={styles.page}>
        <Navbar
          user={currentUser}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />

        <main className={styles.mainContent}>
          {!searchResults ? (
            <>
              <div className={styles.heroSection}>
                {hero ? (
                  <Hero
                    movie={hero}
                    onPlay={() => {
                      const type = hero.media_type === 'tv' || hero.first_air_date ? 'tv' : 'movie';
                      router.push(`/movie/${hero.id}?type=${type}`);
                    }}
                    onMoreInfo={() => openModal(hero)}
                  />
                ) : (
                  <div className={styles.heroPlaceholder} />
                )}
              </div>

              <div className={styles.rows}>
                <Row
                  label="🔴 Live Sports & TV Channels"
                  movies={LIVE_CHANNELS}
                  onCardClick={openModal}
                  onAddToList={handleAddToList}
                  myList={myList}
                />

                {myList.length > 0 && (
                  <Row
                    label="My List"
                    movies={myList}
                    onCardClick={openModal}
                    onAddToList={handleAddToList}
                    myList={myList}
                  />
                )}
                {ROWS.map(({ slug, label }) =>
                  rows[slug]?.length > 0 ? (
                    <Row
                      key={slug}
                      label={label}
                      movies={rows[slug]}
                      isLargeRow={slug === 'trending'}
                      isTop10={slug === 'top10'}
                      onCardClick={openModal}
                      onAddToList={handleAddToList}
                      myList={myList}
                    />
                  ) : null
                )}
              </div>
            </>
          ) : (
            <div className={styles.searchPage}>
              <h2 className={styles.searchTitle}>
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : 'Search Results'}
              </h2>
              <div className={styles.searchGrid}>
                {searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className={styles.searchCard}
                      onClick={() => openModal(movie)}
                    >
                      <img
                        src={movie.poster_url || movie.poster_path}
                        alt={movie.title || movie.name}
                        className={styles.searchPoster}
                      />
                      <p className={styles.searchCardTitle}>{movie.title || movie.name}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#aaa' }}>No results found.</p>
                )}
              </div>
            </div>
          )}
        </main>

        {modal && (
          <Modal
            movie={modal}
            onClose={() => setModal(null)}
            onAddToList={handleAddToList}
            myList={myList}
          />
        )}

        <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
        <Footer />
      </div>
    </>
  );
}

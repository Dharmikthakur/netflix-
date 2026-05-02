import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState({});
  const [hero, setHero] = useState(null);
  const [modal, setModal] = useState(null);
  const [myList, setMyList] = useState([]);
  const [toast, setToast] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

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
  }, [status]);

  const fetchMyList = async () => {
    try {
      const { data } = await axios.get('/api/mylist');
      setMyList(data.myList || []);
    } catch (e) {
      console.error('MyList fetch error:', e);
    }
  };

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  const handleAddToList = async (movie) => {
    const inList = myList.some((m) => m.id === movie.id);
    try {
      if (inList) {
        await axios.delete('/api/mylist', { data: { id: movie.id } });
        setMyList((prev) => prev.filter((m) => m.id !== movie.id));
        showToast(`Removed "${movie.title || movie.name}" from My List`);
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
        setMyList((prev) => [...prev, movie]);
        showToast(`Added "${movie.title || movie.name}" to My List`);
      }
    } catch (e) {
      showToast('Please sign in to save to My List');
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
    try {
      const type = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie';
      const { data } = await axios.get(`/api/movies/${type}/${item.id}`);
      setModal(data);
    } catch (e) {
      setModal(item);
    }
  };

  if (status === 'loading') {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Netfix by Dharmik — Browse</title>
        <meta name="description" content="Browse thousands of movies and TV shows on Netfix by Dharmik." />
      </Head>

      <div className={styles.page}>
        <Navbar
          user={session?.user}
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

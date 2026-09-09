import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import Modal from '../components/Modal';
import { LIVE_CHANNELS } from '../data/liveChannels';
import styles from '../styles/Live.module.css';

const CATEGORIES = [
  'All',
  'Sony Sports Network',
  'Cricket',
  'Football',
  'Motorsport',
  'Tennis',
  'Basketball',
];

export default function LiveTV() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [modal, setModal] = useState(null);
  const [myList, setMyList] = useState([]);

  // Top featured channel for hero banner
  const featured = LIVE_CHANNELS[0];

  const filteredChannels = activeCategory === 'All'
    ? LIVE_CHANNELS
    : LIVE_CHANNELS.filter((c) => c.category === activeCategory);

  const handleCardClick = (channel) => {
    setModal(channel);
  };

  const handlePlayStream = (channelId) => {
    router.push(`/live/${channelId}`);
  };

  return (
    <>
      <Head>
        <title>Live TV & Sports Broadcasts — Netfix by Dharmik</title>
        <meta name="description" content="Watch FIFA 2026, ICC T20 World Cup, El Clásico, F1, Wimbledon & NBA live streams." />
      </Head>

      <div className={styles.liveContainer}>
        <Navbar user={{ name: 'Guest' }} onSearch={() => {}} />

        {/* Featured Live Event Hero */}
        <div
          className={styles.hero}
          style={{ backgroundImage: `url(${featured.backdropPath})` }}
        >
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.liveBadgeHeader}>
              <span className={styles.pulsatingDot} /> LIVE NOW
            </div>
            <span className={styles.heroCategory}>{featured.category}</span>
            <h1 className={styles.heroTitle}>{featured.title}</h1>
            {featured.score && <div className={styles.heroScore}>{featured.score}</div>}
            {featured.odds && <div className={styles.heroOdds}>{featured.odds}</div>}
            <button
              className={styles.watchBtn}
              onClick={() => handlePlayStream(featured.id)}
            >
              <svg fill="black" viewBox="0 0 24 24" width="22" height="22">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Stream
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className={styles.filterSection}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterTab} ${activeCategory === cat ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Channels Grid */}
        <div className={styles.gridSection}>
          <h2 className={styles.sectionTitle}>
            {activeCategory === 'All' ? '🔴 All Live Channels & Streams' : `🔴 Live ${activeCategory}`}
          </h2>
          <div className={styles.grid}>
            {filteredChannels.map((channel) => (
              <MovieCard
                key={channel.id}
                movie={channel}
                onClick={() => handleCardClick(channel)}
                onAddToList={() => {}}
                inList={false}
              />
            ))}
          </div>
        </div>

        {modal && (
          <Modal
            movie={modal}
            onClose={() => setModal(null)}
            onAddToList={() => {}}
            myList={[]}
          />
        )}

        <Footer />
      </div>
    </>
  );
}

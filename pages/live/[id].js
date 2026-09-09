import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { LIVE_CHANNELS, getLiveChannelById } from '../../data/liveChannels';
import styles from '../../styles/Live.module.css';

export default function LivePlayer() {
  const router = useRouter();
  const { id } = router.query;
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!id) return;
    const found = getLiveChannelById(id);
    if (found) {
      setChannel(found);
    } else {
      setChannel(LIVE_CHANNELS[0]);
    }
  }, [id]);

  if (!channel) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  const handleSwitchChannel = (newId) => {
    router.push(`/live/${newId}`);
  };

  return (
    <>
      <Head>
        <title>{channel.title} - Watch Live on Netfix</title>
      </Head>

      <div className={styles.playerPage}>
        <Navbar user={{ name: 'Guest' }} onSearch={() => {}} />

        {/* Player Top Bar */}
        <div className={styles.playerHeader}>
          <button
            className={styles.playerBackBtn}
            onClick={() => router.push('/live')}
          >
            <svg fill="white" viewBox="0 0 24 24" width="20" height="20">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Live TV
          </button>

          <div className={styles.playerMetaInfo}>
            <div className={styles.liveBadgeHeader} style={{ margin: 0 }}>
              <span className={styles.pulsatingDot} /> LIVE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.playerTitle}>{channel.title}</span>
              <span style={{ fontSize: '12px', color: '#46d369', fontWeight: 'bold' }}>
                {channel.score} {channel.odds ? `• ${channel.odds}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className={styles.videoWrapper}>
          <iframe
            src={channel.embedUrl}
            className={styles.videoIframe}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title={channel.title}
          />
        </div>

        {/* Bottom Channel Switcher */}
        <div className={styles.playerFooter}>
          <div className={styles.channelBarTitle}>Switch Live Channel</div>
          <div className={styles.channelList}>
            {LIVE_CHANNELS.map((ch) => (
              <div
                key={ch.id}
                className={`${styles.channelCard} ${
                  ch.id === channel.id ? styles.activeChannelCard : ''
                }`}
                onClick={() => handleSwitchChannel(ch.id)}
              >
                <img
                  src={ch.backdropPath}
                  alt={ch.title}
                  className={styles.channelThumb}
                />
                <div className={styles.channelInfo}>
                  <div className={styles.channelName}>{ch.title}</div>
                  <div className={styles.channelCategory}>{ch.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

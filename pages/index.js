import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/browse');
    }
  }, [status, router]);

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
        <title>Netfix by Dharmik — Watch TV Shows & Movies Online</title>
        <meta name="description" content="Watch movies and TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more." />
      </Head>

      <div className={styles.landing}>
        {/* Navbar */}
        <nav className={styles.nav}>
          <div className={styles.logo}>
             <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ color: '#e50914', fontSize: 24, fontWeight: 900, fontFamily: 'Inter, sans-serif' }}>netfix</span>
                <span style={{ color: '#adadad', fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: -2 }}>BY DHARMIK</span>
             </div>
          </div>
          <Link href="/login">
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
              Sign In
            </button>
          </Link>
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Unlimited movies, TV shows, and more</h1>
            <p className={styles.heroSub}>Watch anywhere. Cancel anytime.</p>
            <p className={styles.heroDesc}>Ready to watch? Create your account to start streaming.</p>
            <div className={styles.heroActions}>
              <Link href="/register">
                <button className="btn btn-primary" style={{ fontSize: 18, padding: '14px 32px' }}>
                  Get Started
                </button>
              </Link>
              <Link href="/login">
                <button className="btn btn-secondary" style={{ fontSize: 18, padding: '14px 32px' }}>
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureText}>
              <h2>Enjoy on your TV</h2>
              <p>Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.</p>
            </div>
            <div className={styles.featureImg}>
              <img src="/assets/devices.png" alt="TV" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
          <div className={`${styles.feature} ${styles.featureReverse}`}>
            <div className={styles.featureText}>
              <h2>Download your shows to watch offline</h2>
              <p>Save your favourites easily and always have something to watch.</p>
            </div>
            <div className={styles.featureImg}>
              <img src="/assets/download.png" alt="Download" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureText}>
              <h2>Watch everywhere</h2>
              <p>Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.</p>
            </div>
            <div className={styles.featureImg}>
              <img src="/assets/devices.png" alt="Devices" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerNote}>Questions? Call 1-844-505-2993</p>
          <div className={styles.footerLinks}>
            {['FAQ', 'Help Centre', 'Account', 'Media Centre', 'Investor Relations', 'Jobs', 'Cookie Preferences', 'Privacy', 'Terms of Use', 'Contact Us'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Netflix Clone</p>
        </footer>
      </div>
    </>
  );
}

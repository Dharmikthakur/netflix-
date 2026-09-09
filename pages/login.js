import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('demo@netflix.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('netflix_user', JSON.stringify({
        name: email ? email.split('@')[0] : 'Guest User',
        email: email || 'guest@netflix.com',
      }));
    }
    router.push('/browse');
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Netfix by Dharmik — Sign In</title>
        <meta name="description" content="Sign In to Netfix by Dharmik" />
      </Head>

      <div className={styles.bg} />
      <div className={styles.bgOverlay} />

      {/* Header */}
      <header className={styles.header}>
        <Link href="/browse" className={styles.logoContainer}>
          <div className={styles.logoBrand}>
            <span className={styles.logoRed}>netfix</span>
          </div>
          <div className={styles.logoCredit}>BY DHARMIK</div>
        </Link>
      </header>

      {/* Login Card */}
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Sign In</h1>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="text"
                id="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email" className={styles.floatingLabel}>
                Email or mobile number
              </label>
            </div>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password" className={styles.floatingLabel}>
                Password
              </label>
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
              Sign In
            </button>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <button
              type="button"
              onClick={() => handleLogin()}
              className={styles.guestBtn}
            >
              Explore as Guest (Instant Access)
            </button>

            <div className={styles.helpRow}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogin(); }} className={styles.helpLink}>
                Need help?
              </a>
            </div>
          </form>

          <div className={styles.footerSection}>
            <div className={styles.switch}>
              <span>New to Netflix? </span>
              <Link href="/browse" className={styles.signupLink}>
                Sign up now.
              </Link>
            </div>

            <p className={styles.recaptchaText}>
              This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.{' '}
              <span className={styles.learnMore}>Learn more.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerContact}>Questions? Call 000-800-919-1694</p>
          <div className={styles.footerGrid}>
            <Link href="/browse">FAQ</Link>
            <Link href="/browse">Help Centre</Link>
            <Link href="/browse">Terms of Use</Link>
            <Link href="/browse">Privacy</Link>
            <Link href="/browse">Cookie Preferences</Link>
            <Link href="/browse">Corporate Information</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


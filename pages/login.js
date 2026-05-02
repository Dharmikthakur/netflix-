import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/browse');
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Netflix — Login</title>
      </Head>
      <div className={styles.bg} />
      <nav className={styles.nav}>
        <Link href="/">
          <img src="/assets/logo.png" alt="Netflix" height="32" width="120" />
        </Link>
      </nav>
      
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Sign In
          </button>
        </form>
        <div className={styles.switch}>
          <span>New to Netflix? </span>
          <Link href="/" className={styles.link}>Learn more.</Link>
        </div>
      </div>
    </div>
  );
}

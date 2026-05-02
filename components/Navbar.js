import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.css';

export default function Navbar({ user, onSearch, searchQuery }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      if (prev && searchQuery) onSearch('');
      return !prev;
    });
  };

  const navLinks = [
    { label: 'Home', href: '/browse' },
    { label: 'TV Shows', href: '/browse?type=tv' },
    { label: 'Movies', href: '/browse?type=movie' },
    { label: 'New & Popular', href: '/browse?type=popular' },
    { label: 'My List', href: '/browse?type=mylist' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      {/* Left */}
      <div className={styles.left}>
        <Link href="/browse" className={styles.logo}>
          <img src="/assets/logo.png" alt="Netflix" height="28" width="108" />
        </Link>
        <div className={styles.navLinks}>
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className={styles.navLink}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {/* Search */}
        <div className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`}>
          <button className={styles.iconBtn} onClick={handleSearchToggle} id="search-toggle" aria-label="Search">
            <svg fill="white" viewBox="0 0 24 24" width="22" height="22">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          {searchOpen && (
            <input
              ref={searchRef}
              className={styles.searchInput}
              type="text"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              id="search-input"
            />
          )}
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <svg fill="white" viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>

        {/* Profile */}
        <div className={styles.profileDropdown} onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
          <div className={styles.avatar}>
            {user?.image ? (
              <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>🎬</span>
            )}
          </div>
          <svg fill="white" viewBox="0 0 24 24" width="12" height="12" className={`${styles.caret} ${dropdownOpen ? styles.caretUp : ''}`}>
            <path d="M7 10l5 5 5-5H7z" />
          </svg>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownItem}>
                <span>👤</span> {user?.name || 'Profile'}
              </div>
              <div className={styles.dropdownDivider} />
              <div className={styles.dropdownItem}>
                <span>⚙️</span> Account
              </div>
              <div className={styles.dropdownDivider} />
              <div className={styles.dropdownItem} onClick={() => signOut({ callbackUrl: '/' })}>
                <span>🚪</span> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

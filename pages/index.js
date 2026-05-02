import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/browse');
  }, [router]);

  return (
    <div className="loader">
      <div className="spinner" />
    </div>
  );
}

// src/hooks/useAuth.ts
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCookie } from 'cookies-next';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('authToken');
    if (!token) {
      router.push('/login'); // Redirect to login if token is not found
    }
  }, [router]);
};

export default useAuth;

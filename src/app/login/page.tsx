'use client';

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebaseConfig';
import Image from "next/legacy/image";
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

const logo = '/logo.png';

function getThemeColors(darkMode: boolean) {
  return {
    background: darkMode ? 'black' : '#f5f5f5',
    text: darkMode ? '#fff' : '#111',
    cardBg: darkMode ? '#0b0b0b' : 'white',
    cardBorder: darkMode ? '#333' : '#ddd',
    inputBg: darkMode ? '#0b0b0b' : 'white',
    inputBorder: darkMode ? '#555' : '#ddd',
    inputText: darkMode ? '#fff' : '#111',
    placeholder: darkMode ? '#888' : '#999',
    labelText: darkMode ? '#fff' : '#111'
  };
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Read dark mode preference from localStorage
    const saved = localStorage.getItem('darkMode');
    setDarkMode(saved === 'true');
  }, []);

  // Handle sign-in using Firebase Authentication
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();
      setCookie("authToken", token, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      router.push("/dashboard/weather");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(`Login failed: ${error.message}`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSignIn(); // Call handleSignIn with state variables
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingTop: '48px',
      paddingBottom: '48px',
      background: getThemeColors(darkMode).background,
      color: getThemeColors(darkMode).text,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%', maxWidth: '28rem' }}>
        <Image
          className="mx-auto"
          src={logo}
          alt="Your Company Logo"
          width={200}
          height={200}
          priority
        />
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.875rem',
          fontWeight: 'bold',
          lineHeight: 'normal',
          letterSpacing: '0.025em',
          color: getThemeColors(darkMode).text
        }}>
          Sign in to your account
        </h2>
      </div>

      <div style={{ marginTop: '2.5rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', maxWidth: '28rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              lineHeight: '1.5',
              color: getThemeColors(darkMode).labelText
            }}>
              Email address
            </label>
            <div style={{ marginTop: '8px' }}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  borderRadius: '6px',
                  border: 'none',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  background: getThemeColors(darkMode).inputBg,
                  color: getThemeColors(darkMode).inputText,
                  boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`,
                  outlineWidth: '1px',
                  outlineStyle: 'solid',
                  outlineColor: getThemeColors(darkMode).inputBorder,
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              lineHeight: '1.5',
              color: getThemeColors(darkMode).labelText
            }}>
              Password
            </label>
            <div style={{ marginTop: '8px' }}>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  borderRadius: '6px',
                  border: 'none',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  background: getThemeColors(darkMode).inputBg,
                  color: getThemeColors(darkMode).inputText,
                  boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`,
                  outlineWidth: '1px',
                  outlineStyle: 'solid',
                  outlineColor: getThemeColors(darkMode).inputBorder,
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                borderRadius: '6px',
                background: '#4f46e5',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '12px',
                paddingBottom: '12px',
                fontSize: '0.875rem',
                fontWeight: '600',
                lineHeight: '1.5',
                color: 'white',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4f46e5'}
            >
              Sign in
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '1rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;

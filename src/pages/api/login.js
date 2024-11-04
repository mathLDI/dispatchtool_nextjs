// src/pages/api/login.js
import { NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default async function login(req, res) {
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set HttpOnly cookie
    setCookie({ res }, 'authToken', user.accessToken, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

// File: src/pages/api/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie } from 'cookies-next';

export default function logout(req: NextApiRequest, res: NextApiResponse) {
  console.log("Logout route reached"); // Confirm route is hit
  deleteCookie('authToken', { req, res, path: '/' });
  console.log("authToken cookie deleted");
  res.writeHead(302, { Location: '/login' });
  res.end();
}

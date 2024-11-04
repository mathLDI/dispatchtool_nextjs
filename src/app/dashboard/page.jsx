// src/app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Page() {
  const authToken = cookies().get('authToken');

  if (!authToken) {
    // Redirect to login if not authenticated
    redirect('/login');
  }

  return <p>Dashboard Page</p>;
}

// src/app/page.tsx

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the desired page
  redirect('/dashboard/weather');
  
  return null; // No need to render anything
}

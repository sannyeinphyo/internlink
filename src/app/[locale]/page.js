'use client'

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function App() {
  const { locale } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (locale) {
      router.push(`/${locale}/dashboard`);
    }
  }, [locale, router]);

  return null; // or loading UI if needed
}

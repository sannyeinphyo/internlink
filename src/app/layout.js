
import Head from 'next/head';
import './globals.css';
import { Inter } from 'next/font/google';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Head>
           <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <header>
        </header>
        <main>{children}</main>
        <footer>
        </footer>
      </body>
    </html>
  );
}

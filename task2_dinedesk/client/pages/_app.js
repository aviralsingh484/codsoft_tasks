import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Head>
          <title>DineDesk</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Order food, reserve a table and track your order at DineDesk." />
        </Head>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

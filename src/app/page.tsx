import Link from 'next/link';
import styles from './styles/page.module.css';
import Script from 'next/script';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>stripe payment demo</h1>
      <Link href={'/shopping'}>Shopping</Link>
      <Link href={'/payments'}>Payments</Link>
      <Link href={'/sessions'}>Sessions</Link>
      <Script src="https://js.stripe.com/v3" strategy="beforeInteractive" />
    </main>
  );
}

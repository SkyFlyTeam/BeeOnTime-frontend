// pages/_app.tsx
import '../styles/global.css';
import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp;

import '../styles/global.css';
import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext'; 

// function MyApp({ Component, pageProps }: AppProps) {
//   return (
//     <AuthProvider>
//       <Component {...pageProps} />
//     </AuthProvider>
//   );
// }

// export default MyApp;


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider initialCargo="Administrador" initialCod={18}> 
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;

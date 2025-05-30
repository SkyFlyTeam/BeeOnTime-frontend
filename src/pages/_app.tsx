// General
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Components
import { AppSidebar } from '@/components/custom/Sidebar/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ToastContainer } from "react-toastify";

// Styles
import '../styles/global.css';
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/' || router.pathname === '/cadastro'; // Verifica se é a página de login

  useEffect (() => {
    console.log(router.pathname)
    if (router.pathname === '/logout'){
      router.push('/')
    }
  }, [router.pathname])


  // Se for a página de login, renderiza apenas o componente sem sidebar
  if (isLoginPage) {
    return <Component {...pageProps} />;
  }

  // Para todas as outras páginas, renderiza com a sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 md:px-12 px-4 py-0">
          <Component {...pageProps} />
          <ToastContainer />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Componente Header com useSidebar
function Header() {
  const { state, isMobile, openMobile } = useSidebar();
  return (
    <header className="flex h-8 shrink-0 items-center gap-2 md:px-12 px-3 py-9" style={{ backgroundColor: "#fafbfc" }}>
      {(!isMobile && state === "collapsed") || (isMobile && !openMobile) ? (
        <SidebarTrigger className="-ml-1" />
      ) : null}
      {/* <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" /> */}
    </header>
  );
}

export default MyApp;
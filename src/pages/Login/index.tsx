import './style.css';
import { useAuth } from '../../context/AuthProvider';
import { useEffect } from 'react';


function Login() {
  const { handleLogin, currentUser } = useAuth()

  useEffect(() => {
    handleLogin("test","test");
  }, [])
  return (
    <main>
      <h1>Hello {currentUser?.Usuario_nome}</h1>
    </main>
  );
}

export default Login;

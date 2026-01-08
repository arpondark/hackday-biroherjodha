import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './providers/AuthProvider';
import { AppRoutes } from './routes';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer/Footer';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <div className="h-screen w-screen flex overflow-hidden bg-background-darker">
            <Navbar />
            <main className="flex-1 overflow-y-auto h-full">
              <AppRoutes />
              <Footer />
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

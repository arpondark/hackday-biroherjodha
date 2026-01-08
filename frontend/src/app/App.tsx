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
          <div className="min-h-screen w-full flex flex-col bg-background-dark text-white selection:bg-accent-primary/30 selection:text-white">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <div className="flex-1 pt-20">
                <AppRoutes />
              </div>
              <Footer />
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

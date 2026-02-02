import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Sections (Home Page)
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import BillCheckForm from './sections/BillCheckForm';
import HowItWorks from './sections/HowItWorks';
import Features from './sections/Features';
import Testimonials from './sections/Testimonials';
import FAQ from './sections/FAQ';
import CTA from './sections/CTA';
import Footer from './sections/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

type Page = 'home' | 'login' | 'dashboard';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const mainRef = useRef<HTMLDivElement>(null);

  // GSAP animations for home page
  useEffect(() => {
    if (currentPage !== 'home') return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.animate-on-scroll').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, [currentPage]);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login' && !isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBackClick={handleBackToHome} />;
  }

  // Dashboard Page (protected)
  if (currentPage === 'dashboard' && isAuthenticated) {
    return <Dashboard onBackToHome={handleBackToHome} />;
  }

  // Redirect to login if trying to access dashboard without auth
  if (currentPage === 'dashboard' && !isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBackClick={handleBackToHome} />;
  }

  // Home Page
  return (
    <div ref={mainRef} className="min-h-screen bg-white overflow-x-hidden">
      <Navbar onLoginClick={handleLoginClick} isLoggedIn={isAuthenticated} />
      <main>
        <Hero />
        <BillCheckForm />
        <HowItWorks />
        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

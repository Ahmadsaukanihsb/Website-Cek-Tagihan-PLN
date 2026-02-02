import { useState, useEffect } from 'react';
import { Menu, X, Zap, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
}

const Navbar = ({ onLoginClick, isLoggedIn = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add glassmorphism after scrolling 50px
      setIsScrolled(currentScrollY > 50);

      // Hide/show on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Cek Tagihan', href: '#bill-check' },
    { name: 'Cara Kerja', href: '#how-it-works' },
    { name: 'Fitur', href: '#features' },
    { name: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    setIsMobileMenuOpen(false);
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'backdrop-blur-xl bg-white/90 shadow-sm'
          : 'bg-transparent'
        } ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-blue-dark">
              Cek Tagihan
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="relative text-sm font-medium text-gray-text hover:text-blue-primary transition-colors duration-300 group"
                style={{
                  animationDelay: `${100 + index * 80}ms`,
                }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-blue-primary transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </a>
            ))}
          </div>

          {/* Login Button */}
          <div className="hidden md:block">
            <Button
              onClick={handleLoginClick}
              className="bg-gradient-blue text-white px-6 py-2 rounded-full font-medium hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoggedIn ? 'Dashboard' : 'Login'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-blue-dark" />
            ) : (
              <Menu className="w-6 h-6 text-blue-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg transition-all duration-300 ${isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="block text-base font-medium text-gray-text hover:text-blue-primary transition-colors py-2"
            >
              {link.name}
            </a>
          ))}
          <Button
            onClick={handleLoginClick}
            className="w-full bg-gradient-blue text-white py-3 rounded-full font-medium mt-4"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggedIn ? 'Dashboard' : 'Login'}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

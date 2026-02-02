import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Border line animation
      gsap.fromTo(
        '.footer-border',
        { width: '0%' },
        {
          width: '100%',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Content animations
      gsap.fromTo(
        '.footer-logo',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Links stagger
      gsap.fromTo(
        '.footer-link',
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Social icons
      gsap.fromTo(
        '.social-icon',
        { scale: 0 },
        {
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Cek Tagihan', href: '#bill-check' },
    { name: 'Cara Kerja', href: '#how-it-works' },
    { name: 'Fitur', href: '#features' },
    { name: 'FAQ', href: '#faq' },
  ];

  const services = [
    { name: 'Cek Tagihan PLN', href: '#bill-check' },
    { name: 'Cek Tagihan PDAM', href: '#bill-check' },
    { name: 'Cek Tagihan BPJS', href: '#bill-check' },
    { name: 'Cek Pulsa', href: '#bill-check' },
    { name: 'Cek PBB', href: '#bill-check' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer ref={footerRef} className="bg-blue-dark relative overflow-hidden">
      {/* Top Border */}
      <div className="footer-border h-1 bg-gradient-to-r from-blue-primary via-blue-secondary to-orange-accent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#hero');
              }}
              className="footer-logo inline-flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Cek Tagihan
              </span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Cek tagihan online tanpa ribet. Platform terpercaya untuk
              memeriksa berbagai jenis tagihan Anda.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-icon w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-blue-primary hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">
              Menu Cepat
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="footer-link text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">
              Layanan
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(service.href);
                    }}
                    className="footer-link text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block text-sm"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">
              Kontak Kami
            </h4>
            <ul className="space-y-4">
              <li className="footer-link flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-secondary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:support@cektagihan.id"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  support@cektagihan.id
                </a>
              </li>
              <li className="footer-link flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-secondary flex-shrink-0 mt-0.5" />
                <a
                  href="tel:080012345678"
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  0800-1234-5678
                </a>
              </li>
              <li className="footer-link flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-secondary flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2024 Cek Tagihan. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors"
              >
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

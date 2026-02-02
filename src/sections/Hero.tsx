import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParticleField from '@/components/ParticleField';

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate orbs
      tl.fromTo(
        '.orb-1',
        { x: 100, opacity: 0 },
        { x: 0, opacity: 0.6, duration: 1 },
        0.4
      )
        .fromTo(
          '.orb-2',
          { x: -100, opacity: 0 },
          { x: 0, opacity: 0.4, duration: 1 },
          0.6
        )
        .fromTo(
          '.orb-3',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.5, duration: 0.8, ease: 'back.out(1.7)' },
          0.8
        );

      // Animate headline lines
      const headlineLines = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineLines) {
        headlineLines.forEach((line, index) => {
          tl.fromTo(
            line,
            { clipPath: 'inset(100% 0 0 0)', y: 30, opacity: 0 },
            {
              clipPath: 'inset(0% 0 0 0)',
              y: 0,
              opacity: 1,
              duration: 0.8,
            },
            0.5 + index * 0.15
          );
        });
      }

      // Animate subheadline
      tl.fromTo(
        subheadlineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        1
      );

      // Animate CTA buttons
      tl.fromTo(
        '.cta-primary',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        1.2
      ).fromTo(
        '.cta-secondary',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5 },
        1.35
      );

      // Animate scroll indicator
      tl.fromTo(
        '.scroll-indicator',
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        1.8
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToBillCheck = () => {
    const element = document.querySelector('#bill-check');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-light/30 via-white to-blue-light/20"
    >
      {/* Particle Field */}
      <ParticleField />

      {/* Decorative Orbs */}
      <div ref={orbsRef} className="absolute inset-0 pointer-events-none">
        <div
          className="orb orb-blue orb-1 w-[300px] h-[300px] top-20 right-20 animate-float"
          style={{ filter: 'blur(80px)' }}
        />
        <div
          className="orb orb-orange orb-2 w-[200px] h-[200px] bottom-40 left-20 animate-float-slow"
          style={{ filter: 'blur(60px)', animationDelay: '2s' }}
        />
        <div
          className="orb orb-secondary orb-3 w-[150px] h-[150px] top-1/2 right-1/3 animate-pulse"
          style={{ filter: 'blur(50px)', animationDuration: '4s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)]">
          {/* Left Content */}
          <div className="space-y-8">
            <div ref={headlineRef} className="space-y-2">
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-blue-dark leading-tight">
                <span className="headline-line block overflow-hidden">
                  Cek Tagihan
                </span>
                <span className="headline-line block overflow-hidden text-gradient">
                  Online
                </span>
                <span className="headline-line block overflow-hidden">
                  Tanpa Ribet
                </span>
              </h1>
            </div>

            <p
              ref={subheadlineRef}
              className="text-lg sm:text-xl text-gray-text max-w-lg leading-relaxed"
            >
              Periksa tagihan PLN, PDAM, BPJS, dan berbagai layanan lainnya dalam
              satu platform. Cepat, akurat, dan terpercaya.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Button
                onClick={scrollToBillCheck}
                className="cta-primary bg-gradient-blue text-white px-8 py-6 rounded-full text-lg font-semibold hover:shadow-glow-lg transition-all duration-300 hover:scale-105 group"
              >
                Cek Sekarang
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                className="cta-secondary border-2 border-blue-primary text-blue-primary px-8 py-6 rounded-full text-lg font-semibold hover:bg-blue-primary hover:text-white transition-all duration-300"
                onClick={() => {
                  const element = document.querySelector('#how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-display font-bold text-blue-primary">
                  1M+
                </div>
                <div className="text-sm text-gray-text">Pengguna Aktif</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-blue-primary">
                  5+
                </div>
                <div className="text-sm text-gray-text">Jenis Tagihan</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-blue-primary">
                  24/7
                </div>
                <div className="text-sm text-gray-text">Layanan</div>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-white rounded-3xl shadow-card-hover p-8 w-[400px] transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-blue flex items-center justify-center">
                    <span className="text-white text-xl font-bold">PLN</span>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-dark">Tagihan Listrik</div>
                    <div className="text-sm text-gray-text">Bulan November 2024</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-text">Nomor Pelanggan</span>
                    <span className="font-medium text-blue-dark">1234567890</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-text">Nama</span>
                    <span className="font-medium text-blue-dark">Budi Santoso</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-text">Jatuh Tempo</span>
                    <span className="font-medium text-error">20 Nov 2024</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-text">Total Tagihan</span>
                      <span className="text-2xl font-display font-bold text-blue-primary">
                        Rp 450.000
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-blue rounded-full" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-text text-center">
                  Daya: 1300 VA | Pemakaian: 234 kWh
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-card p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-primary font-bold text-sm">PDAM</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-text">Tagihan Air</div>
                    <div className="font-semibold text-blue-dark">Rp 185.000</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-card p-4 animate-float-slow"
                style={{ animationDelay: '1s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-success font-bold text-sm">BPJS</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-text">Iuran Kesehatan</div>
                    <div className="font-semibold text-blue-dark">Rp 150.000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-text">
        <span className="text-sm">Scroll untuk melihat lebih</span>
        <ChevronDown className="w-5 h-5 animate-bounce-subtle" />
      </div>
    </section>
  );
};

export default Hero;

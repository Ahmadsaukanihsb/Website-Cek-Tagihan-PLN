import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.cta-headline',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Subheadline animation
      gsap.fromTo(
        '.cta-subheadline',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Button animation
      gsap.fromTo(
        buttonRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Orbs animation
      gsap.fromTo(
        '.cta-orb',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
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
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-blue-primary via-blue-secondary to-blue-dark relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div
          className="cta-orb absolute w-[500px] h-[500px] rounded-full bg-white/5 -top-40 -left-40 animate-float"
          style={{ filter: 'blur(100px)' }}
        />
        <div
          className="cta-orb absolute w-[400px] h-[400px] rounded-full bg-orange-accent/10 bottom-0 right-0 animate-float-slow"
          style={{ filter: 'blur(80px)', animationDelay: '2s' }}
        />
        <div
          className="cta-orb absolute w-[300px] h-[300px] rounded-full bg-blue-light/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ filter: 'blur(60px)', animationDuration: '4s' }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Sparkle Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm">
          <Sparkles className="w-8 h-8 text-orange-accent" />
        </div>

        {/* Headline */}
        <h2 className="cta-headline font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
          Siap untuk Cek Tagihan?
        </h2>

        {/* Subheadline */}
        <p className="cta-subheadline text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
          Daftar sekarang dan nikmati kemudahan cek tagihan online tanpa ribet.
          Gratis dan mudah digunakan!
        </p>

        {/* CTA Button */}
        <Button
          ref={buttonRef}
          onClick={scrollToBillCheck}
          className="bg-white text-blue-primary px-10 py-7 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 group animate-pulse-glow"
        >
          Mulai Sekarang
          <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Gratis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Cepat</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

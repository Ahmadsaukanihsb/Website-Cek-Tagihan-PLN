import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Shield,
  Smartphone,
  Clock,
  History,
  Layers,
} from 'lucide-react';
import type { Feature } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const features: Feature[] = [
  {
    id: '1',
    title: 'Cepat & Akurat',
    description:
      'Dapatkan hasil pengecekan tagihan dalam hitungan detik dengan akurasi tinggi.',
    icon: 'zap',
  },
  {
    id: '2',
    title: 'Aman & Terpercaya',
    description:
      'Data Anda aman dengan sistem keamanan berlapis dan enkripsi terkini.',
    icon: 'shield',
  },
  {
    id: '3',
    title: 'Mudah Digunakan',
    description:
      'Antarmuka yang intuitif dan ramah pengguna untuk semua kalangan.',
    icon: 'smartphone',
  },
  {
    id: '4',
    title: '24/7 Tersedia',
    description:
      'Akses kapan saja, di mana saja, tanpa batasan waktu operasional.',
    icon: 'clock',
  },
  {
    id: '5',
    title: 'Riwayat Tagihan',
    description:
      'Simpan dan pantau riwayat tagihan Anda untuk manajemen keuangan lebih baik.',
    icon: 'history',
  },
  {
    id: '6',
    title: 'Multi Layanan',
    description:
      'Satu platform untuk berbagai jenis tagihan PLN, PDAM, BPJS, dan lainnya.',
    icon: 'layers',
  },
];

const getIcon = (iconName: string) => {
  const props = { className: 'w-7 h-7' };
  switch (iconName) {
    case 'zap':
      return <Zap {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'smartphone':
      return <Smartphone {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'history':
      return <History {...props} />;
    case 'layers':
      return <Layers {...props} />;
    default:
      return <Zap {...props} />;
  }
};

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.features-title',
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

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );

        // Icon animations
        const icons = cardsRef.current?.querySelectorAll('.feature-icon');
        if (icons) {
          gsap.fromTo(
            icons,
            { scale: 0, rotate: -10 },
            {
              scale: 1,
              rotate: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #2d57dc 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="features-title text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-blue-dark mb-4">
            Kenapa Memilih <span className="text-gradient">Kami?</span>
          </h2>
          <p className="text-gray-text text-lg max-w-xl mx-auto">
            Keunggulan yang membuat kami menjadi pilihan terbaik
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`feature-card group bg-white rounded-2xl p-6 shadow-card border border-gray-100 transition-all duration-400 hover:shadow-card-hover hover:-translate-y-2 hover:border-blue-primary/20 ${
                index % 3 === 1 ? 'lg:mt-10' : index % 3 === 2 ? 'lg:mt-5' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Icon */}
              <div className="feature-icon w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-gradient-blue group-hover:scale-110">
                <div className="text-blue-primary transition-colors duration-300 group-hover:text-white">
                  {getIcon(feature.icon)}
                </div>
              </div>

              {/* Content */}
              <h3 className="font-display font-semibold text-xl text-blue-dark mb-3 transition-colors duration-300 group-hover:text-blue-primary">
                {feature.title}
              </h3>
              <p className="text-gray-text leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

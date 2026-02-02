import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    role: 'Pengusaha',
    content:
      'Sangat memudahkan saya dalam cek tagihan listrik dan air. Tidak perlu lagi antre di loket. Prosesnya cepat dan hasilnya akurat!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    role: 'Ibu Rumah Tangga',
    content:
      'Aplikasi yang sangat bermanfaat. Saya bisa cek tagihan BPJS keluarga kapan saja. Interface-nya juga mudah dipahami.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ahmad Wijaya',
    role: 'Karyawan',
    content:
      'Cepat dan akurat. Fitur riwayat tagihan membantu saya mengatur keuangan bulanan dengan lebih baik. Highly recommended!',
    rating: 5,
  },
  {
    id: '4',
    name: 'Dewi Kusuma',
    role: 'Freelancer',
    content:
      'Interface yang bersih dan mudah digunakan. Saya bisa cek semua tagihan dalam satu aplikasi. Sangat direkomendasikan!',
    rating: 5,
  },
  {
    id: '5',
    name: 'Rudi Hartono',
    role: 'Pegawai Negeri',
    content:
      'Layanan yang sangat membantu. Saya tidak perlu lagi khawatir lupa membayar tagihan karena ada notifikasi jatuh tempo.',
    rating: 5,
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.testimonials-title',
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

      // Cards animation
      gsap.fromTo(
        '.testimonial-card',
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.testimonials-track',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((activeIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    goToSlide((activeIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-24 bg-gradient-dark relative overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-blue-primary/20 -top-20 -left-20"
          style={{ filter: 'blur(100px)' }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full bg-blue-secondary/20 bottom-0 right-0"
          style={{ filter: 'blur(80px)' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="testimonials-title text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Apa Kata <span className="text-orange-accent">Mereka?</span>
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Testimoni dari pengguna setia kami
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Track */}
          <div className="testimonials-track overflow-hidden">
            <div
              ref={trackRef}
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${activeIndex * (100 / 3)}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => {
                const isActive = index === activeIndex;
                const isAdjacent =
                  index === (activeIndex - 1 + testimonials.length) % testimonials.length ||
                  index === (activeIndex + 1) % testimonials.length;

                return (
                  <div
                    key={testimonial.id}
                    className={`testimonial-card flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4 transition-all duration-500 ${
                      isActive
                        ? 'scale-100 opacity-100'
                        : isAdjacent
                        ? 'scale-95 opacity-60'
                        : 'scale-90 opacity-40'
                    }`}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 h-full border border-white/10 hover:bg-white/15 transition-all duration-300">
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <Quote className="w-8 h-8 text-orange-accent/50" />
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-orange-accent text-orange-accent"
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <p className="text-white/90 leading-relaxed mb-6">
                        "{testimonial.content}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-blue flex items-center justify-center text-white font-semibold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-white/60">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-8 bg-orange-accent'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

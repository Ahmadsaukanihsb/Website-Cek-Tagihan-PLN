import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, FormInput, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: 1,
    title: 'Pilih Jenis Tagihan',
    description:
      'Pilih jenis tagihan yang ingin Anda cek dari berbagai pilihan yang tersedia seperti PLN, PDAM, BPJS, dan lainnya.',
    icon: Search,
  },
  {
    id: 2,
    title: 'Masukkan Nomor',
    description:
      'Masukkan nomor pelanggan atau ID Anda dengan benar sesuai dengan jenis tagihan yang dipilih.',
    icon: FormInput,
  },
  {
    id: 3,
    title: 'Lihat Hasil',
    description:
      'Dapatkan informasi tagihan Anda secara instan dan akurat dalam hitungan detik.',
    icon: CheckCircle,
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.hiw-title',
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

      // Line drawing animation
      if (lineRef.current) {
        const length = lineRef.current.getTotalLength();
        gsap.set(lineRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(lineRef.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Steps animation
      const stepElements = stepsRef.current?.querySelectorAll('.step-item');
      if (stepElements) {
        stepElements.forEach((step, index) => {
          const isEven = index % 2 === 1;
          const icon = step.querySelector('.step-icon');
          const number = step.querySelector('.step-number');
          const title = step.querySelector('.step-title');
          const desc = step.querySelector('.step-desc');

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });

          tl.fromTo(
            icon,
            { scale: 0, rotate: isEven ? 180 : -180 },
            {
              scale: 1,
              rotate: 0,
              duration: 0.6,
              ease: 'back.out(1.7)',
            }
          )
            .fromTo(
              number,
              { scale: 0 },
              { scale: 1, duration: 0.4, ease: 'power3.out' },
              '-=0.3'
            )
            .fromTo(
              title,
              { x: isEven ? 30 : -30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
              '-=0.2'
            )
            .fromTo(
              desc,
              { opacity: 0 },
              { opacity: 1, duration: 0.4 },
              '-=0.2'
            );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="hiw-title text-center mb-20">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-blue-dark mb-4">
            Cara <span className="text-gradient">Kerja</span>
          </h2>
          <p className="text-gray-text text-lg max-w-xl mx-auto">
            Tiga langkah mudah untuk cek tagihan
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative">
          {/* Connecting Line (Desktop) */}
          <svg
            className="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 hidden lg:block"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2d57dc" />
                <stop offset="50%" stopColor="#4b71f7" />
                <stop offset="100%" stopColor="#ffa41c" />
              </linearGradient>
            </defs>
            <path
              ref={lineRef}
              d="M 100 8 Q 300 8 400 8 Q 500 8 600 8 Q 700 8 800 8 Q 900 8 1000 8"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="10 5"
            />
          </svg>

          {/* Steps Grid */}
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 1;

              return (
                <div
                  key={step.id}
                  className={`step-item relative ${
                    isEven ? 'lg:mt-16' : ''
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      isEven ? 'lg:flex-col-reverse' : ''
                    } items-center text-center`}
                  >
                    {/* Icon */}
                    <div
                      className={`step-icon relative w-24 h-24 rounded-2xl bg-gradient-blue flex items-center justify-center mb-6 shadow-glow-lg ${
                        isEven ? 'lg:mb-0 lg:mt-6' : ''
                      }`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                      {/* Step Number */}
                      <div className="step-number absolute -top-3 -right-3 w-10 h-10 bg-orange-accent rounded-full flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
                        {step.id}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`space-y-3 ${
                        isEven ? 'lg:mb-6' : ''
                      }`}
                    >
                      <h3 className="step-title font-display font-semibold text-xl text-blue-dark">
                        {step.title}
                      </h3>
                      <p className="step-desc text-gray-text leading-relaxed max-w-xs mx-auto">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Connector */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-8">
                      <div className="w-1 h-16 bg-gradient-to-b from-blue-primary to-orange-accent rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-text mb-6">
            Sudah paham? Yuk cek tagihan Anda sekarang!
          </p>
          <button
            onClick={() => {
              const element = document.querySelector('#bill-check');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-blue text-white px-8 py-4 rounded-full font-semibold hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
          >
            Mulai Cek Tagihan
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

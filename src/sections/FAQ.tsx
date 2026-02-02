import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FAQItem } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Apa itu Cek Tagihan?',
    answer:
      'Cek Tagihan adalah platform online yang memungkinkan Anda memeriksa berbagai jenis tagihan seperti PLN, PDAM, BPJS, dan lainnya secara cepat dan akurat. Kami menyediakan layanan yang aman dan terpercaya untuk membantu Anda mengelola pembayaran tagihan.',
  },
  {
    id: '2',
    question: 'Apakah layanan ini gratis?',
    answer:
      'Ya, layanan cek tagihan di platform kami sepenuhnya gratis. Anda hanya membayar tagihan Anda jika ingin melakukan pembayaran melalui mitra pembayaran kami.',
  },
  {
    id: '3',
    question: 'Bagaimana cara cek tagihan PLN?',
    answer:
      'Pilih menu PLN, masukkan nomor meter atau ID pelanggan Anda, lalu klik "Cek Tagihan". Hasil akan muncul dalam hitungan detik menampilkan total tagihan, detail pemakaian, dan tanggal jatuh tempo.',
  },
  {
    id: '4',
    question: 'Apakah data saya aman?',
    answer:
      'Sangat aman. Kami menggunakan enkripsi SSL dan sistem keamanan berlapis untuk melindungi data Anda. Kami tidak menyimpan informasi sensitif Anda dan selalu mengutamakan privasi pengguna.',
  },
  {
    id: '5',
    question: 'Bisa cek tagihan apa saja?',
    answer:
      'Anda bisa cek tagihan PLN (listrik), PDAM (air), BPJS Kesehatan, pulsa/prabayar, PBB (pajak bumi dan bangunan), dan berbagai tagihan lainnya. Kami terus menambahkan jenis tagihan baru.',
  },
  {
    id: '6',
    question: 'Bagaimana jika tagihan tidak muncul?',
    answer:
      'Pastikan nomor pelanggan yang dimasukkan benar. Jika masalah berlanjut, kemungkinan data dari provider sedang tidak tersedia atau tagihan belum diterbitkan. Silakan coba lagi nanti atau hubungi layanan pelanggan kami.',
  },
];

const FAQ = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.faq-title',
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

      // Left border animation
      gsap.fromTo(
        '.faq-border',
        { height: '0%' },
        {
          height: '100%',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.faq-list',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // FAQ items animation
      const items = document.querySelectorAll('.faq-item');
      gsap.fromTo(
        items,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.faq-list',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="faq-title text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-blue-primary" />
            <span className="text-sm font-medium text-blue-primary">FAQ</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-blue-dark mb-4">
            Pertanyaan <span className="text-gradient">Umum</span>
          </h2>
          <p className="text-gray-text text-lg max-w-xl mx-auto">
            Temukan jawaban atas pertanyaan Anda
          </p>
        </div>

        {/* FAQ List */}
        <div className="faq-list relative">
          {/* Left Border */}
          <div className="faq-border absolute left-0 top-0 w-1 bg-gradient-to-b from-blue-primary via-blue-secondary to-orange-accent rounded-full" />

          <div className="space-y-4 pl-6">
            {faqItems.map((item, index) => (
              <div
                key={item.id}
                className={`faq-item bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? 'border-blue-primary/30 shadow-card'
                    : 'border-gray-200 hover:border-blue-primary/20 hover:bg-blue-50/30'
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span
                    className={`font-medium text-lg transition-colors duration-300 ${
                      openIndex === index
                        ? 'text-blue-primary'
                        : 'text-blue-dark'
                    }`}
                  >
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-blue-primary text-white rotate-180'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-400 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                  style={{
                    transitionTimingFunction: 'var(--ease-expo-out)',
                  }}
                >
                  <div className="px-5 pb-5">
                    <p className="text-gray-text leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-text mb-4">
            Masih punya pertanyaan? Hubungi kami!
          </p>
          <a
            href="mailto:support@cektagihan.id"
            className="inline-flex items-center gap-2 text-blue-primary font-medium hover:underline"
          >
            support@cektagihan.id
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

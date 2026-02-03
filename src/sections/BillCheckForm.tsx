import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Droplets,
  Shield,
  Smartphone,
  Home,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { BillType, BillResult } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const billTypes: BillType[] = [
  {
    id: 'pln',
    name: 'PLN',
    icon: 'zap',
    placeholder: 'Contoh: 1234567890',
    label: 'Nomor Meter/ID Pelanggan',
  },
  {
    id: 'pdam',
    name: 'PDAM',
    icon: 'droplets',
    placeholder: 'Contoh: 9876543210',
    label: 'Nomor Pelanggan PDAM',
  },
  {
    id: 'bpjs',
    name: 'BPJS',
    icon: 'shield',
    placeholder: 'Contoh: 0001234567890',
    label: 'Nomor BPJS Kesehatan',
  },
  {
    id: 'pulsa',
    name: 'Pulsa',
    icon: 'smartphone',
    placeholder: 'Contoh: 081234567890',
    label: 'Nomor Handphone',
  },
  {
    id: 'pbb',
    name: 'PBB',
    icon: 'home',
    placeholder: 'Contoh: 1234567890',
    label: 'NOP (Nomor Objek Pajak)',
  },
];

const getIcon = (iconName: string, className?: string) => {
  const props = { className: className || 'w-5 h-5' };
  switch (iconName) {
    case 'zap':
      return <Zap {...props} />;
    case 'droplets':
      return <Droplets {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'smartphone':
      return <Smartphone {...props} />;
    case 'home':
      return <Home {...props} />;
    default:
      return <Zap {...props} />;
  }
};

// API Configuration - Using backend proxy
const PLN_API_URL = '/api/cek-tagihan-pln';

// Interface for PLN API Response
interface PLNApiResponse {
  status?: boolean | string;
  success?: boolean;
  rescode?: string;
  message?: string;
  data?: {
    produk?: string;
    nama_pelanggan?: string;
    nomor_id_pelanggan?: string;
    periode_tagihan?: string;
    tarif_daya?: string;
    stand_meter?: string;
    jumlah_tagihan_excl_fee?: number;
    biaya_admin?: number;
    total_pembayaran_incl_fee?: number;
    // Legacy field names for backward compatibility
    customer_name?: string;
    customer_number?: string;
    tariff?: string;
    power?: string;
    total_bill?: number;
    bill_amount?: number;
    admin_fee?: number;
    period?: string;
    due_date?: string;
  };
}

// Function to check PLN bill using real API
const checkPLNBill = async (customerNumber: string): Promise<BillResult> => {
  try {
    const response = await fetch(PLN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_number: customerNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PLNApiResponse = await response.json();

    // Check if API returned success (status: "SUCCESS")
    if (data.status === 'SUCCESS' || data.status === true || data.success === true) {
      const billData = data.data;

      // Build details array from API response
      const details: Array<{ item: string; amount: number }> = [];

      // Add billing period
      if (billData?.periode_tagihan) {
        details.push({
          item: `Tagihan ${billData.periode_tagihan}`,
          amount: billData.jumlah_tagihan_excl_fee || 0,
        });
      }

      // Add admin fee
      if (billData?.biaya_admin) {
        details.push({
          item: 'Biaya Admin',
          amount: billData.biaya_admin,
        });
      }

      return {
        success: true,
        customerName: billData?.nama_pelanggan || 'Pelanggan PLN',
        billAmount: billData?.total_pembayaran_incl_fee || 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'unpaid',
        period: billData?.tarif_daya || 'R-1/450 VA',
        details: details.length > 0 ? details : [{ item: 'Total Tagihan', amount: billData?.total_pembayaran_incl_fee || 0 }],
      };
    } else {
      return {
        success: false,
        message: data.message || 'Nomor pelanggan tidak ditemukan. Silakan periksa kembali.',
      };
    }
  } catch (error) {
    console.error('Error checking PLN bill:', error);
    return {
      success: false,
      message: error instanceof Error
        ? `Gagal menghubungi server: ${error.message}`
        : 'Terjadi kesalahan saat mengecek tagihan. Silakan coba lagi.',
    };
  }
};

// Mock function for other bill types (PDAM, BPJS, etc.)
const mockCheckBill = async (type: string, _number: string): Promise<BillResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: Record<string, BillResult> = {
        pdam: {
          success: true,
          customerName: 'Siti Rahayu',
          billAmount: 185000,
          dueDate: '2024-11-25',
          status: 'unpaid',
          period: 'November 2024',
          details: [
            { item: 'Pemakaian Air (25 m³)', amount: 165000 },
            { item: 'Biaya Administrasi', amount: 20000 },
          ],
        },
        bpjs: {
          success: true,
          customerName: 'Ahmad Wijaya',
          billAmount: 150000,
          dueDate: '2024-11-30',
          status: 'unpaid',
          period: 'November 2024',
          details: [
            { item: 'Iuran BPJS Kelas I', amount: 150000 },
          ],
        },
        pulsa: {
          success: true,
          customerName: 'Telkomsel',
          billAmount: 50000,
          dueDate: '2024-11-15',
          status: 'unpaid',
          period: 'Pra-bayar',
          details: [
            { item: 'Pulsa Reguler', amount: 50000 },
          ],
        },
        pbb: {
          success: true,
          customerName: 'Dewi Kusuma',
          billAmount: 2500000,
          dueDate: '2024-12-31',
          status: 'unpaid',
          period: '2024',
          details: [
            { item: 'PBB Tahunan', amount: 2500000 },
          ],
        },
      };

      resolve(mockData[type] || {
        success: false,
        message: 'Jenis tagihan tidak didukung.',
      });
    }, 1500);
  });
};

// Main function to check bill based on type
const checkBill = async (type: string, number: string): Promise<BillResult> => {
  if (type === 'pln') {
    return checkPLNBill(number);
  }
  return mockCheckBill(type, number);
};

const BillCheckForm = () => {
  const [selectedType, setSelectedType] = useState<BillType>(billTypes[0]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BillResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Title animation
      tl.fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );

      // Tabs animation
      const tabs = tabsRef.current?.querySelectorAll('.tab-item');
      if (tabs) {
        tl.fromTo(
          tabs,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        );
      }

      // Form animation
      tl.fromTo(
        formRef.current,
        { y: 60, rotateX: 10, opacity: 0 },
        { y: 0, rotateX: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.2'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCheck = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setShowResult(false);

    const response = await checkBill(selectedType.id, inputValue);

    setResult(response);
    setIsLoading(false);
    setShowResult(true);

    // Animate result
    gsap.fromTo(
      '.result-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section
      id="bill-check"
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #2d57dc 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-blue-dark mb-4">
            Cek Tagihan <span className="text-gradient">Online</span>
          </h2>
          <p className="text-gray-text text-lg max-w-xl mx-auto">
            Pilih jenis tagihan dan masukkan nomor pelanggan Anda
          </p>
        </div>

        {/* Bill Type Tabs */}
        <div
          ref={tabsRef}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {billTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setInputValue('');
                setShowResult(false);
              }}
              className={`tab-item flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${selectedType.id === type.id
                ? 'bg-blue-primary text-white shadow-glow scale-105'
                : 'bg-white text-gray-text hover:bg-blue-50 hover:text-blue-primary border border-gray-200'
                }`}
            >
              {getIcon(type.icon, 'w-4 h-4')}
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div ref={formRef} style={{ perspective: '1000px' }}>
          <Card className="card-3d shadow-card-hover border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Input Group */}
                <div>
                  <label className="block text-sm font-medium text-blue-dark mb-2">
                    {selectedType.label}
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {getIcon(selectedType.icon, 'w-5 h-5')}
                      </div>
                      <Input
                        type="text"
                        placeholder={selectedType.placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                        className="pl-12 py-6 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-primary focus:ring-4 focus:ring-blue-primary/10 transition-all duration-300"
                      />
                    </div>
                    <Button
                      onClick={handleCheck}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-gradient-blue text-white px-8 py-6 rounded-xl font-semibold hover:shadow-glow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Cek
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-2 text-sm text-gray-text bg-blue-50 p-4 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-blue-primary flex-shrink-0" />
                  <span>
                    Masukkan {selectedType.label.toLowerCase()} dengan benar untuk
                    mendapatkan hasil yang akurat.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result Card */}
        {showResult && result && (
          <div className="result-card mt-8">
            <Card
              className={`border-0 rounded-3xl overflow-hidden ${result.success ? 'shadow-card-hover' : 'shadow-card'
                }`}
            >
              <CardContent className="p-0">
                {result.success ? (
                  <div>
                    {/* Result Header */}
                    <div className="bg-gradient-blue p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            {getIcon(selectedType.icon, 'w-6 h-6 text-white')}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">
                              {selectedType.name}
                            </div>
                            <div className="text-white/80 text-sm">
                              {result.period}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowResult(false)}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Result Body */}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b">
                        <span className="text-gray-text">Nama Pelanggan</span>
                        <span className="font-semibold text-blue-dark">
                          {result.customerName}
                        </span>
                      </div>

                      {result.details?.map((detail, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-text">{detail.item}</span>
                          <span className="font-medium text-blue-dark">
                            {formatCurrency(detail.amount)}
                          </span>
                        </div>
                      ))}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-gray-text">Jatuh Tempo</span>
                        <span
                          className={`font-medium ${result.status === 'overdue'
                            ? 'text-error'
                            : 'text-blue-dark'
                            }`}
                        >
                          {formatDate(result.dueDate || '')}
                        </span>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-text font-medium">
                            Total Tagihan
                          </span>
                          <span className="text-2xl font-display font-bold text-blue-primary">
                            {formatCurrency(result.billAmount || 0)}
                          </span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-blue text-white py-4 rounded-xl font-semibold hover:shadow-glow-lg transition-all duration-300 mb-4">
                        Bayar Sekarang
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-error" />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-blue-dark mb-2">
                      Data Tidak Ditemukan
                    </h3>
                    <p className="text-gray-text mb-4">{result.message}</p>
                    <Button
                      onClick={() => setShowResult(false)}
                      variant="outline"
                      className="border-2 border-blue-primary text-blue-primary hover:bg-blue-primary hover:text-white"
                    >
                      Coba Lagi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success State Demo */}
        {!showResult && !isLoading && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-card flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-gray-text">Cepat</div>
                <div className="font-semibold text-blue-dark">Real-time</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-card flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-text">Aman</div>
                <div className="font-semibold text-blue-dark">Terenkripsi</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-card flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-orange-accent" />
              </div>
              <div>
                <div className="text-sm text-gray-text">Akurat</div>
                <div className="font-semibold text-blue-dark">Terpercaya</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BillCheckForm;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import {
    Zap,
    LogOut,
    TrendingUp,
    Clock,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    BarChart3,
    Activity,
    Home,
    Loader2,
    Printer,
    Edit2,
    Check,
    X,
    Plus,
    Trash2,
} from 'lucide-react';

interface DashboardProps {
    onBackToHome?: () => void;
}

interface Transaction {
    id: string;
    customerNumber: string;
    customerName: string;
    type: 'PLN' | 'PDAM' | 'BPJS';
    amount: number;
    status: 'success' | 'pending' | 'failed';
    date: string;
}

interface PLNResult {
    success: boolean;
    customerNumber?: string;
    customerName?: string;
    tariffPower?: string;
    standMeter?: string;
    billDetails?: Array<{ period: string; amount: number }>;
    billAmount?: number;
    adminFee?: number;
    totalPayment?: number;
    error?: string;
}


const Dashboard = ({ onBackToHome }: DashboardProps) => {
    const { admin, logout } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const printRef = useRef<HTMLDivElement>(null);

    // PLN Check State
    const [plnNumber, setPlnNumber] = useState('');
    const [isCheckingPLN, setIsCheckingPLN] = useState(false);
    const [plnResult, setPLNResult] = useState<PLNResult | null>(null);

    // Edit Admin Fee State
    const [isEditingAdminFee, setIsEditingAdminFee] = useState(false);
    const [editedAdminFee, setEditedAdminFee] = useState(0);

    // Add Transaction Modal State
    const [showAddModal, setShowAddModal] = useState(false);

    const [newTransaction, setNewTransaction] = useState({
        customerNumber: '',
        customerName: '',
        type: 'PLN' as 'PLN' | 'PDAM' | 'BPJS',
        amount: 0,
        status: 'success' as 'success' | 'pending' | 'failed',
    });

    // Fetch transactions from API
    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/transactions');
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Add transaction via API
    const handleAddTransaction = async () => {
        if (!newTransaction.customerName || !newTransaction.customerNumber || newTransaction.amount <= 0) {
            return;
        }

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTransaction),
            });

            const data = await response.json();
            if (data.success) {
                setTransactions([data.data, ...transactions]);
                setNewTransaction({
                    customerNumber: '',
                    customerName: '',
                    type: 'PLN',
                    amount: 0,
                    status: 'success',
                });
                setShowAddModal(false);
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    // Delete transaction via API
    const handleDeleteTransaction = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            try {
                const response = await fetch(`/api/transactions/${id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();
                if (data.success) {
                    setTransactions(transactions.filter(t => t.id !== id));
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchTransactions();
        setIsRefreshing(false);
    };

    const handleLogout = () => {
        logout();
        if (onBackToHome) {
            onBackToHome();
        }
    };

    const handleCheckPLN = async () => {
        if (!plnNumber.trim()) return;

        setIsCheckingPLN(true);
        setPLNResult(null);
        setIsEditingAdminFee(false);

        try {
            const response = await fetch('/api/cek-tagihan-pln', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ customer_number: plnNumber }),
            });

            // Handle non-OK responses
            if (!response.ok) {
                setPLNResult({
                    success: false,
                    error: `Gagal: Status HTTP ${response.status}`,
                });
                return;
            }

            const data = await response.json();

            // Check for success - API returns status: "SUCCESS"
            if (data.status === 'SUCCESS' || data.status === true || data.success === true) {
                const billData = data.data;

                // Parse bill details from periode_tagihan
                const billDetails: Array<{ period: string; amount: number }> = [];
                if (billData?.periode_tagihan) {
                    billDetails.push({
                        period: billData.periode_tagihan,
                        amount: billData.jumlah_tagihan_excl_fee || 0,
                    });
                }

                const adminFee = billData?.biaya_admin || 0;
                setEditedAdminFee(adminFee);

                setPLNResult({
                    success: true,
                    customerNumber: billData?.nomor_id_pelanggan || plnNumber,
                    customerName: billData?.nama_pelanggan || 'N/A',
                    tariffPower: billData?.tarif_daya || 'N/A',
                    standMeter: billData?.stand_meter || 'N/A',
                    billDetails,
                    billAmount: billData?.jumlah_tagihan_excl_fee || 0,
                    adminFee: adminFee,
                    totalPayment: billData?.total_pembayaran_incl_fee || 0,
                });
            } else {
                setPLNResult({
                    success: false,
                    error: data.message || 'Gagal mengecek tagihan PLN',
                });
            }
        } catch (err) {
            console.error('PLN Check Error:', err);
            setPLNResult({
                success: false,
                error: 'Terjadi kesalahan saat mengecek tagihan',
            });
        } finally {
            setIsCheckingPLN(false);
        }
    };

    // Handle edit admin fee
    const handleStartEditAdminFee = () => {
        if (plnResult?.adminFee !== undefined) {
            setEditedAdminFee(plnResult.adminFee);
            setIsEditingAdminFee(true);
        }
    };

    const handleSaveAdminFee = () => {
        if (plnResult) {
            const newTotal = (plnResult.billAmount || 0) + editedAdminFee;
            setPLNResult({
                ...plnResult,
                adminFee: editedAdminFee,
                totalPayment: newTotal,
            });
        }
        setIsEditingAdminFee(false);
    };

    const handleCancelEditAdminFee = () => {
        if (plnResult?.adminFee !== undefined) {
            setEditedAdminFee(plnResult.adminFee);
        }
        setIsEditingAdminFee(false);
    };

    // Handle print - Plain text format for thermal printers
    const handlePrint = () => {
        if (!plnResult?.success) return;

        // Format currency helper
        const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

        // Build plain text receipt (32 char width for 58mm thermal)
        const line = '================================';
        const dashed = '--------------------------------';

        let receipt = `
${line}
       STRUK TAGIHAN PLN
${line}
${new Date().toLocaleString('id-ID')}
${dashed}
No Pelanggan : ${plnResult.customerNumber || '-'}
Nama         : ${plnResult.customerName || '-'}
Tarif/Daya   : ${plnResult.tariffPower || '-'}
Stand Meter  : ${plnResult.standMeter || '-'}
${dashed}
`;

        // Add bill details if any
        if (plnResult.billDetails && plnResult.billDetails.length > 0) {
            plnResult.billDetails.forEach(d => {
                receipt += `${d.period.padEnd(16)} ${fmt(d.amount).padStart(15)}\n`;
            });
            receipt += dashed + '\n';
        }

        receipt += `Tagihan      : ${fmt(plnResult.billAmount || 0)}
Admin Bank   : ${fmt(plnResult.adminFee || 0)}
${dashed}
TOTAL BAYAR  : ${fmt(plnResult.totalPayment || 0)}
${line}
   Terima kasih atas pembayaran
      Simpan struk sebagai bukti
${line}
`;

        // Create simple HTML with preformatted text
        const printContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Struk PLN</title>
<style>
body{margin:0;padding:5mm;font-family:monospace;font-size:10pt;}
pre{white-space:pre-wrap;margin:0;}
@media print{@page{margin:0;size:58mm auto;}}
</style>
</head>
<body>
<pre>${receipt}</pre>
<script>
window.onload = function() {
    window.print();
};
</script>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
        } else {
            alert('Popup diblokir! Izinkan popup untuk mencetak.');
        }
    };

    const filteredTransactions = transactions.filter(
        (t) =>
            t.customerNumber.includes(searchQuery) ||
            t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        totalTransactions: transactions.length,
        successTransactions: transactions.filter((t) => t.status === 'success').length,
        totalRevenue: transactions
            .filter((t) => t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0),
        pendingTransactions: transactions.filter((t) => t.status === 'pending').length,
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1';
        switch (status) {
            case 'success':
                return `${baseClasses} bg-green-100 text-green-700`;
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-700`;
            case 'failed':
                return `${baseClasses} bg-red-100 text-red-700`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-700`;
        }
    };

    const getTypeBadge = (type: string) => {
        const baseClasses = 'px-2 py-1 rounded-lg text-xs font-semibold';
        switch (type) {
            case 'PLN':
                return `${baseClasses} bg-blue-100 text-blue-700`;
            case 'PDAM':
                return `${baseClasses} bg-cyan-100 text-cyan-700`;
            case 'BPJS':
                return `${baseClasses} bg-purple-100 text-purple-700`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-700`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Dashboard Admin</h1>
                                <p className="text-xs text-gray-500">Cek Tagihan Online</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                                <p className="text-xs text-gray-500">
                                    {currentTime.toLocaleString('id-ID', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </p>
                            </div>
                            {onBackToHome && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onBackToHome}
                                    className="border-gray-200 hover:bg-gray-50"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Beranda
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* PLN Check Card */}
                <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Zap className="w-5 h-5" />
                                Cek Tagihan PLN
                            </CardTitle>

                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Masukkan ID Pelanggan PLN..."
                                    value={plnNumber}
                                    onChange={(e) => setPlnNumber(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheckPLN()}
                                />
                            </div>
                            <Button
                                onClick={handleCheckPLN}
                                disabled={isCheckingPLN || !plnNumber.trim()}
                                className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-8"
                            >
                                {isCheckingPLN ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Mengecek...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Cek Tagihan
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* PLN Result */}
                        {plnResult && (
                            <div ref={printRef} className="mt-4 p-4 rounded-lg bg-white text-gray-900">
                                {plnResult.success ? (
                                    <div className="space-y-3">
                                        {/* Customer Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 border-b border-gray-200">
                                            <div className="flex justify-between sm:block">
                                                <span className="text-gray-500 text-sm">No Pelanggan</span>
                                                <span className="font-semibold sm:block sm:ml-0 ml-2">
                                                    : {plnResult.customerNumber}
                                                </span>
                                            </div>
                                            <div className="flex justify-between sm:block">
                                                <span className="text-gray-500 text-sm">Nama</span>
                                                <span className="font-semibold sm:block sm:ml-0 ml-2">
                                                    : {plnResult.customerName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between sm:block">
                                                <span className="text-gray-500 text-sm">Tarif/Daya</span>
                                                <span className="font-semibold sm:block sm:ml-0 ml-2">
                                                    : {plnResult.tariffPower}
                                                </span>
                                            </div>
                                            <div className="flex justify-between sm:block">
                                                <span className="text-gray-500 text-sm">Stand Meter</span>
                                                <span className="font-semibold sm:block sm:ml-0 ml-2">
                                                    : {plnResult.standMeter}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bill Details */}
                                        {plnResult.billDetails && plnResult.billDetails.length > 0 && (
                                            <div className="pb-3 border-b border-gray-200">
                                                <p className="text-gray-500 text-sm font-medium mb-2">Rincian Tagihan</p>
                                                {plnResult.billDetails.map((detail, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{detail.period}</span>
                                                        <span className="font-medium">: {formatCurrency(detail.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Payment Summary */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 text-sm">Rp Tagihan</span>
                                                <span className="font-medium">
                                                    : {formatCurrency(plnResult.billAmount || 0)}
                                                </span>
                                            </div>

                                            {/* Editable Admin Fee */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-sm flex items-center gap-2">
                                                    Admin Bank
                                                    {!isEditingAdminFee && (
                                                        <button
                                                            onClick={handleStartEditAdminFee}
                                                            className="text-blue-500 hover:text-blue-700"
                                                            title="Edit Admin Bank"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </span>
                                                {isEditingAdminFee ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>: Rp</span>
                                                        <Input
                                                            type="number"
                                                            value={editedAdminFee}
                                                            onChange={(e) => setEditedAdminFee(Number(e.target.value))}
                                                            className="w-24 h-7 text-sm px-2"
                                                        />
                                                        <button
                                                            onClick={handleSaveAdminFee}
                                                            className="text-green-500 hover:text-green-700"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditAdminFee}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium">
                                                        : {formatCurrency(plnResult.adminFee || 0)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                                <span className="font-bold text-gray-900">Total Bayar</span>
                                                <span className="font-bold text-lg text-blue-600">
                                                    : {formatCurrency(plnResult.totalPayment || 0)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Print Button */}
                                        <div className="pt-3 border-t border-gray-200">
                                            <Button
                                                onClick={handlePrint}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Printer className="w-4 h-4 mr-2" />
                                                Print Struk
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{plnResult.error}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Transaksi</p>
                                    <p className="text-3xl font-bold mt-1">{stats.totalTransactions}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Berhasil</p>
                                    <p className="text-3xl font-bold mt-1">{stats.successTransactions}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Total Pendapatan</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold mt-1">{stats.pendingTransactions}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Riwayat Transaksi</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    Daftar semua transaksi pengecekan tagihan
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Cari transaksi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-64 border-gray-200"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="border-gray-200"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            ID Transaksi
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Pelanggan
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Tipe
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Jumlah
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Waktu
                                        </th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-medium text-gray-900">
                                                        {transaction.id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{transaction.customerName}</p>
                                                        <p className="text-sm text-gray-500">{transaction.customerNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getTypeBadge(transaction.type)}>{transaction.type}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={getStatusBadge(transaction.status)}>
                                                        {getStatusIcon(transaction.status)}
                                                        {transaction.status === 'success'
                                                            ? 'Berhasil'
                                                            : transaction.status === 'pending'
                                                                ? 'Pending'
                                                                : 'Gagal'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{transaction.date}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                        title="Hapus transaksi"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Tambah Transaksi</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nama Pelanggan</label>
                                <Input
                                    type="text"
                                    placeholder="Masukkan nama pelanggan"
                                    value={newTransaction.customerName}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, customerName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nomor Pelanggan</label>
                                <Input
                                    type="text"
                                    placeholder="Masukkan nomor pelanggan"
                                    value={newTransaction.customerNumber}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, customerNumber: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tipe</label>
                                <select
                                    value={newTransaction.type}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'PLN' | 'PDAM' | 'BPJS' })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="PLN">PLN</option>
                                    <option value="PDAM">PDAM</option>
                                    <option value="BPJS">BPJS</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                                <Input
                                    type="number"
                                    placeholder="Masukkan jumlah"
                                    value={newTransaction.amount || ''}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={newTransaction.status}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as 'success' | 'pending' | 'failed' })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="success">Berhasil</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Gagal</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-xl">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleAddTransaction}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah
                            </Button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Dashboard;

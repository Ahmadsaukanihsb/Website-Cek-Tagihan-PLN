import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Trash2,
    Save,
    X,
    Users,
    FileText,
    RefreshCw,
    Check,
} from 'lucide-react';

interface Bill {
    period: string;
    amount: number;
    isPaid: boolean;
}

interface PLNCustomer {
    customerNumber: string;
    customerName: string;
    tariffPower: string;
    standMeter: string;
    bills: Bill[];
    adminFee: number;
}

interface PLNCustomerManagerProps {
    onClose?: () => void;
}

export default function PLNCustomerManager({ onClose }: PLNCustomerManagerProps) {
    const [customers, setCustomers] = useState<PLNCustomer[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBillForm, setShowBillForm] = useState<string | null>(null);

    // Form states
    const [newCustomer, setNewCustomer] = useState({
        customerNumber: '',
        customerName: '',
        tariffPower: 'R1/900VA',
        standMeter: '',
        adminFee: 2500,
    });

    const [newBill, setNewBill] = useState({
        period: '',
        amount: 0,
    });

    // Fetch customers on mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/pln-customers');
            const data = await response.json();
            if (data.success) {
                setCustomers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!newCustomer.customerNumber || !newCustomer.customerName) {
            alert('Nomor pelanggan dan nama harus diisi');
            return;
        }

        try {
            const response = await fetch('/api/pln-customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer),
            });
            const data = await response.json();

            if (data.success) {
                setCustomers([data.data, ...customers]);
                setNewCustomer({
                    customerNumber: '',
                    customerName: '',
                    tariffPower: 'R1/900VA',
                    standMeter: '',
                    adminFee: 2500,
                });
                setShowAddForm(false);
            } else {
                alert(data.message || 'Gagal menambahkan pelanggan');
            }
        } catch (error) {
            console.error('Failed to add customer:', error);
            alert('Terjadi kesalahan');
        }
    };

    const handleDeleteCustomer = async (customerNumber: string) => {
        if (!confirm('Hapus pelanggan ini?')) return;

        try {
            const response = await fetch(`/api/pln-customers/${customerNumber}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setCustomers(customers.filter(c => c.customerNumber !== customerNumber));
            }
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    };

    const handleAddBill = async (customerNumber: string) => {
        if (!newBill.period || !newBill.amount) {
            alert('Periode dan jumlah tagihan harus diisi');
            return;
        }

        try {
            const response = await fetch(`/api/pln-customers/${customerNumber}/bills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBill),
            });
            const data = await response.json();

            if (data.success) {
                setCustomers(customers.map(c =>
                    c.customerNumber === customerNumber ? data.data : c
                ));
                setNewBill({ period: '', amount: 0 });
                setShowBillForm(null);
            }
        } catch (error) {
            console.error('Failed to add bill:', error);
        }
    };

    const handlePayBill = async (customerNumber: string, billIndex: number) => {
        try {
            const response = await fetch(`/api/pln-customers/${customerNumber}/bills/${billIndex}/pay`, {
                method: 'PUT',
            });
            const data = await response.json();

            if (data.success) {
                setCustomers(customers.map(c =>
                    c.customerNumber === customerNumber ? data.data : c
                ));
            }
        } catch (error) {
            console.error('Failed to pay bill:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getTotalUnpaid = (bills: Bill[]) => {
        return bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white border-gray-200 shadow-2xl">
                <CardHeader className="border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Users className="h-5 w-5" />
                            Manajemen Pelanggan PLN
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchCustomers}
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setShowAddForm(true)}
                                className="bg-white text-blue-600 hover:bg-gray-100"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Tambah Pelanggan
                            </Button>
                            {onClose && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto p-4 bg-gray-50">
                    {/* Add Customer Form */}
                    {showAddForm && (
                        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">Tambah Pelanggan Baru</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder="Nomor Pelanggan (12 digit)"
                                    value={newCustomer.customerNumber}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, customerNumber: e.target.value })}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    maxLength={12}
                                />
                                <input
                                    type="text"
                                    placeholder="Nama Pelanggan"
                                    value={newCustomer.customerName}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value.toUpperCase() })}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <select
                                    value={newCustomer.tariffPower}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, tariffPower: e.target.value })}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="R1/450VA">R1/450VA</option>
                                    <option value="R1/900VA">R1/900VA</option>
                                    <option value="R1/1300VA">R1/1300VA</option>
                                    <option value="R1/2200VA">R1/2200VA</option>
                                    <option value="R2/3500VA">R2/3500VA</option>
                                    <option value="R2/5500VA">R2/5500VA</option>
                                    <option value="R3/6600VA+">R3/6600VA+</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Stand Meter"
                                    value={newCustomer.standMeter}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, standMeter: e.target.value })}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Biaya Admin"
                                    value={newCustomer.adminFee}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, adminFee: parseInt(e.target.value) || 0 })}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddCustomer}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Save className="h-4 w-4 mr-1" />
                                        Simpan
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddForm(false)}
                                        className="text-gray-600 border-gray-300"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada pelanggan PLN</p>
                            <p className="text-sm">Klik "Tambah Pelanggan" untuk menambahkan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customers.map((customer) => (
                                <div
                                    key={customer.customerNumber}
                                    className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-blue-600 font-bold">
                                                    {customer.customerNumber}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                                    {customer.tariffPower}
                                                </span>
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">{customer.customerName}</p>
                                            <p className="text-sm text-gray-500">Stand Meter: {customer.standMeter || '-'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowBillForm(customer.customerNumber)}
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Tagihan
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteCustomer(customer.customerNumber)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Bills Section */}
                                    {customer.bills.length > 0 && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-500 font-medium">Rincian Tagihan:</span>
                                                <span className="text-red-600 font-bold">
                                                    Total Belum Bayar: {formatCurrency(getTotalUnpaid(customer.bills))}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {customer.bills.map((bill, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center justify-between text-sm p-2 rounded-lg ${bill.isPaid
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                            }`}
                                                    >
                                                        <span className="font-medium">{bill.period}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold">{formatCurrency(bill.amount)}</span>
                                                            {bill.isPaid ? (
                                                                <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full font-medium">LUNAS</span>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePayBill(customer.customerNumber, idx)}
                                                                    className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    <Check className="h-3 w-3 mr-1" />
                                                                    Bayar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add Bill Form */}
                                    {showBillForm === customer.customerNumber && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <h4 className="text-sm font-semibold mb-2 text-blue-700">Tambah Tagihan</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Periode (mis: JAN 2024)"
                                                    value={newBill.period}
                                                    onChange={(e) => setNewBill({ ...newBill, period: e.target.value.toUpperCase() })}
                                                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Jumlah"
                                                    value={newBill.amount || ''}
                                                    onChange={(e) => setNewBill({ ...newBill, amount: parseInt(e.target.value) || 0 })}
                                                    className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddBill(customer.customerNumber)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setShowBillForm(null)}
                                                    className="text-gray-600 border-gray-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

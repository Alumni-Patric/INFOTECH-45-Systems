import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { ArrowLeft, Plus, Search, Eye, FileText, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentVoucherTable() {

    const [paymentVouchers, setPaymentVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Fetch Payment Voucher data
    const fetchPV = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(firestore, "Payment Voucher"));

            // Log all documents for debugging
            console.log("All documents in Payment Voucher collection:");
            querySnapshot.docs.forEach((doc, index) => {
                console.log(`Document ${index}:`, {
                    id: doc.id,
                    data: doc.data()
                });
            });

            const dataList = querySnapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))
                // Filter out any document that is not a payment voucher
                .filter((doc) => {
                    // Remove documents that are specifically marked as "Accounts"
                    if (doc.Type === "Accounts") return false;

                    // Only include documents that have essential payment voucher fields
                    return doc.PV_NO && (doc.Name || doc.Payee) && doc.Amount !== undefined && doc.Amount !== null;
                });

            console.log("Filtered payment vouchers:", dataList);

            // Sort by date from latest to oldest (descending order)
            const sortedData = dataList.sort((a, b) => {
                const dateA = new Date(a.Date_Recorded || '1900-01-01');
                const dateB = new Date(b.Date_Recorded || '1900-01-01');
                return dateB - dateA; // Latest to oldest
            });

            setPaymentVouchers(sortedData);
        } catch (error) {
            console.log("Error fetching Payment Vouchers:", error);
            toast.error("Error loading payment vouchers");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount
    React.useEffect(() => {
        fetchPV();
    }, []);

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleEdit = (id) => {
        // Navigate to payment voucher form with voucher ID
        navigate(`/payment-voucher-form/${id}`);
    };

    // Filter vouchers based on search
    const filteredVouchers = paymentVouchers.filter(voucher =>
        voucher.PV_NO?.toLowerCase().includes(search.toLowerCase()) ||
        voucher.Name?.toLowerCase().includes(search.toLowerCase()) ||
        voucher.Purpose?.toLowerCase().includes(search.toLowerCase()) ||
        voucher.RFP_NO?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Vouchers</h1>
                        <p className="text-muted-foreground">A comprehensive list of all payment vouchers with their details and amounts</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => handleNavigation('/')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={() => handleNavigation('/payment-voucher')} className="bg-[#263145] hover:bg-[#1a2332] text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Payment Voucher
                        </Button>
                    </div>
                </div>

                {/* Search Section */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search vouchers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Payment Voucher Records
                            </span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {filteredVouchers.length} {filteredVouchers.length === 1 ? 'record' : 'records'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <Loader2 className="w-12 h-12 text-muted-foreground mb-4 animate-spin" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Loading payment vouchers...</h3>
                                <p className="text-muted-foreground text-center">
                                    Please wait while we fetch your data
                                </p>
                            </div>
                        ) : filteredVouchers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {search ? 'No matching vouchers found' : 'No payment vouchers found'}
                                </h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    {search
                                        ? "Try adjusting your search criteria"
                                        : "Create your first payment voucher using the form above"
                                    }
                                </p>
                                {search ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearch("")}
                                    >
                                        Clear search
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleNavigation('/payment-voucher')} className="bg-[#263145] hover:bg-[#1a2332] text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Payment Voucher
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <div className="grid grid-cols-[15%_15%_20%_25%_12%_13%] min-w-[1000px]">
                                        {/* Fixed Header */}
                                        <div className="contents">
                                            <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Voucher No</div>
                                            <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">RFP No</div>
                                            <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Payee</div>
                                            <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Purpose</div>
                                            <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Total Amount</div>
                                            <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Actions</div>
                                        </div>

                                        {/* Scrollable Body */}
                                        <div className="contents">
                                            <div className="overflow-y-auto max-h-[500px] col-span-6">
                                                {filteredVouchers.map((voucher, idx) => (
                                                    <div key={voucher.id || idx} className="grid grid-cols-[15%_15%_20%_25%_12%_13%] border-b hover:bg-muted/30 transition-colors">
                                                        <div className="p-4">
                                                            <div className="font-medium text-foreground">
                                                                {voucher.PV_NO || '-'}
                                                            </div>
                                                        </div>
                                                        <div className="p-4 text-muted-foreground">
                                                            {voucher.RFP_NO || '-'}
                                                        </div>
                                                        <div className="p-4 text-muted-foreground">
                                                            {voucher.Name || '-'}
                                                        </div>
                                                        <div className="p-4 text-muted-foreground">
                                                            {voucher.Purpose || '-'}
                                                        </div>
                                                        <div className="p-4 text-muted-foreground">
                                                            {voucher.Amount !== undefined ? `₱${Number(voucher.Amount).toLocaleString()}` : '-'}
                                                        </div>
                                                        <div className="p-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(voucher.PV_NO || voucher.id)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
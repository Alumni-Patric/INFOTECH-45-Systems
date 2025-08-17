import React, { useEffect, useState } from "react";
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { Link } from "react-router-dom";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Search, Filter, ArrowLeft, Plus, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function PayslipUI() {
    const [payslips, setPayslips] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        setIsLoading(true);

        // Set up real-time listener for payslips
        const unsubscribe = onSnapshot(
            collection(firestore, "Payslip"),
            (snapshot) => {
                const dataList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPayslips(dataList);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching payslips:", error);
                setPayslips([]);
                setIsLoading(false);
                toast.error("Failed to load payslips");
            }
        );

        // Cleanup function to unsubscribe when component unmounts
        return () => unsubscribe();
    }, []);

    const filteredPayslips = payslips
        .filter(p => p.Employee_Name?.toLowerCase().includes(search.toLowerCase()))
        .filter(p => {
            // Status filter
            if (statusFilter === "Approved") {
                return p.signature; // Show only payslips with signatures
            } else if (statusFilter === "Pending") {
                return !p.signature && p.Status === "Pending"; // Show only pending payslips without signatures
            } else if (statusFilter === "all") {
                return true; // Show all payslips
            }
            return false;
        })
        .sort((a, b) => {
            // Sort by creation timestamp if available, otherwise by ID (newest first)
            if (a.CreatedAt && b.CreatedAt) {
                return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            }
            // If no timestamp, sort by ID (assuming newer IDs are created later)
            return b.id.localeCompare(a.id);
        });

    const getStatusIcon = (hasSignature) => {
        if (hasSignature) {
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        }
        return <Clock className="w-4 h-4 text-orange-500" />;
    };

    const getStatusBadge = (hasSignature) => {
        if (hasSignature) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Approved
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <Clock className="w-3 h-3" />
                Pending
            </span>
        );
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payslip Management</h1>
                            <p className="text-muted-foreground">Detailed records of employment earnings and deductions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" asChild>
                                <Link to="/">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go Back
                                </Link>
                            </Button>
                            <Button asChild className="bg-[#263145] hover:bg-[#1a2332] text-white">
                                <Link to="/payslip-form">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Payslip
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Filters and Search Section */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Status Filter */}
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="h-9 pl-10 pr-8 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring appearance-none cursor-pointer min-w-[140px]"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10"
                                        placeholder="Search by employee name..."
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
                                <span>Payslip Records</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {filteredPayslips.length} {filteredPayslips.length === 1 ? 'record' : 'records'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {[...Array(5)].map((_, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-muted rounded animate-pulse w-1/4"></div>
                                                    <div className="h-3 bg-muted rounded animate-pulse w-1/3"></div>
                                                </div>
                                                <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
                                                <div className="h-8 bg-muted rounded animate-pulse w-24"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : filteredPayslips.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No payslips found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        {search || statusFilter !== "all"
                                            ? "Try adjusting your search or filter criteria"
                                            : "Create your first payslip using the form above"
                                        }
                                    </p>
                                    {search || statusFilter !== "all" ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearch("");
                                                setStatusFilter("all");
                                            }}
                                        >
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Button asChild>
                                            <Link to="/payslip-form">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Payslip
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <div className="grid grid-cols-[30%_25%_25%_12%_8%] min-w-[800px]">
                                            {/* Fixed Header */}
                                            <div className="contents">
                                                <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Employee</div>
                                                <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Designation</div>
                                                <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Payment Period</div>
                                                <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b">Status</div>
                                                <div className="sticky top-0 z-10 bg-muted/50 p-4 font-medium text-muted-foreground border-b text-right">Actions</div>
                                            </div>

                                            {/* Scrollable Body */}
                                            <div className="contents">
                                                <div className="overflow-y-auto max-h-[500px] col-span-5">
                                                    {filteredPayslips.map((payslip) => (
                                                        <div key={payslip.id} className="grid grid-cols-[30%_25%_25%_12%_8%] border-b hover:bg-muted/30 transition-colors">
                                                            <div className="p-4">
                                                                <div className="font-medium text-foreground">
                                                                    {payslip.Employee_Name}
                                                                </div>
                                                            </div>
                                                            <div className="p-4 text-muted-foreground">
                                                                {payslip.Designation}
                                                            </div>
                                                            <div className="p-4 text-muted-foreground">
                                                                {payslip.Payment_Period}
                                                            </div>
                                                            <div className="p-4">
                                                                {getStatusBadge(payslip.signature)}
                                                            </div>
                                                            <div className="p-4 text-right">
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link to={`/payslip/${payslip.id}`}>
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        View
                                                                    </Link>
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
            <Footer />
        </>
    );
}

export default PayslipUI;
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { FileText, Users, ArrowRight } from "lucide-react";

const PVHomePage = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                        Welcome to the Payment System
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Manage your payment vouchers and employee payslips efficiently with our comprehensive system
                    </p>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Payment Voucher Card */}
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleNavigation('/payment-voucher-table')}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-10 h-10 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                Payment Voucher
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Create, manage, and track payment vouchers for various transactions and expenses
                            </p>
                            <div className="flex items-center justify-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Access System</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payslip Card */}
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleNavigation('/payslipUI')}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                Payslip Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Generate and manage employee payslips with detailed compensation breakdowns
                            </p>
                            <div className="flex items-center justify-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-300">
                                <span>Access System</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information Section */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center text-xl">System Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">Document Management</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Efficiently organize and track all payment documents
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">Employee Records</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Comprehensive employee compensation tracking
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                                        <ArrowRight className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">Quick Access</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Streamlined navigation and user-friendly interface
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PVHomePage;

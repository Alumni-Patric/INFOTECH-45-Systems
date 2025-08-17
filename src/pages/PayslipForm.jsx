import React, { useState } from 'react';
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import { collection, setDoc, getDocs, doc } from "firebase/firestore";
import { firestore } from "../firebase.js";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { ArrowLeft, Plus, Minus, Calculator, User, Calendar, DollarSign, FileText } from "lucide-react";

const PayslipForm = () => {
    const [employeeName, setEmployeeName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [designation, setDesignation] = useState("");
    const [basicPay, setBasicPay] = useState(0);
    const [statutoryDeductions, setStatutoryDeductions] = useState([]);
    const [otherDeductions, setOtherDeductions] = useState([]);
    const [honorarium, setHonorarium] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]); // Default to today
    const [endDate, setEndDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const statutoryDeductionsOptions = ["SSS", "PhilHealth", "Pag-IBIG"]; //Add more statutory deductions as needed
    const otherDeductionsOptions = ["Late", "Absence", "Salary Advance"]; //Add more other deductions as needed

    {/* Function to format the date range for the payslip */ }
    const getFormattedDate = (startDate, endDate) => {
        if (!startDate || !endDate) return "";

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            toast.error("End date cannot be earlier than start date.");
            return;
        }

        const sameMonth = start.getMonth() === end.getMonth();
        const sameYear = start.getFullYear() === end.getFullYear();

        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(start);

        if (sameMonth && sameYear) {
            return `${monthName} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
        } else {
            const startFormatted = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(start);
            const endFormatted = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(end);
            return `${startFormatted} - ${endFormatted}`;
        }
    }

    const cleanedOtherDeductions = otherDeductions.map((deduction) => {
        if (deduction.name === "Custom") {
            return {
                name: deduction.customName?.trim() || "Unnamed Deduction", // fallback just in case
                amount: deduction.amount,
            };
        }
        return {
            name: deduction.name,
            amount: deduction.amount,
        };
    });


    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        setStartDate(selectedDate);

        // If end date is not set or is before the start date, reset it
        if (endDate && new Date(endDate) < new Date(selectedDate)) {
            setEndDate("");
        }
    };

    {/* Function to handle end date change to not surpass the start date*/ }
    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        if (new Date(selectedDate) < new Date(startDate)) {
            toast.error("End date cannot be earlier than start date.");
            return;
        }
        setEndDate(selectedDate);
    }

    const inputModeProps = {
        inputMode: "decimal",
        pattern: "[0-9]*",
        onWheel: (e) => e.target.blur(),
    };

    const calculateTotal = (arr) =>
        arr.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const totalDeductions = calculateTotal(statutoryDeductions) + calculateTotal(otherDeductions);
    const totalPay = parseFloat(basicPay || 0) - totalDeductions;
    const netPay = totalPay + (parseFloat(honorarium) || 0) + (parseFloat(allowance) || 0);

    const isFormValid =
        employeeName.trim() !== "" &&
        employeeId.trim() !== "" &&
        designation.trim() !== "" &&
        startDate !== "" &&
        endDate !== "" &&
        parseFloat(basicPay) > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true); //Locks the button   

        if (!isFormValid) {
            toast.error("Please fill in all required fields before submitting.");
            return;
        }

        const loadingToast = toast.loading('Saving payslip...');

        try {
            // Reference to the 'Payment Voucher' collection
            const payslipCollection = collection(firestore, "Payslip");
            // Fetch all documents in the collection
            const snapshot = await getDocs(payslipCollection);

            // Calculate the next document number dynamically
            const existingIds = snapshot.docs.map((doc) => parseInt(doc.id.split('-')[1], 10)).filter((id) => !isNaN(id));
            const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

            // Create a new document with the next ID
            const payslipDocId = `payslip-${nextId}`;
            await setDoc(doc(firestore, "Payslip", payslipDocId), {
                Employee_Name: employeeName || "",
                Employee_Id: employeeId || "",
                Designation: designation || "",
                Basic_Pay: parseFloat(basicPay) || 0,
                Statutory_Deductions: statutoryDeductions,
                Other_Deductions: cleanedOtherDeductions,
                Honorarium: parseFloat(honorarium) || 0,
                Allowance: parseFloat(allowance) || 0,
                Total_Pay: totalPay,
                Net_Pay: netPay,
                Payment_Period: getFormattedDate(startDate, endDate),
                Status: "Pending",
                CreatedAt: new Date().toISOString(),
                Timestamp: new Date(),
            });


            // Clear all form fields
            setEmployeeName("");
            setEmployeeId("");
            setDesignation("");
            setBasicPay(0);
            setStatutoryDeductions([]);
            setOtherDeductions([]);
            setHonorarium(0);
            setAllowance(0);
            setStartDate(() => new Date().toISOString().split('T')[0]); // Reset to today
            setEndDate("");

            // Scroll to top after a short delay to ensure DOM has updated
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);

            toast.dismiss(loadingToast);
            toast.success("Payslip saved successfully!");
            navigate('/payslipUI'); // Navigate to Payslip UI after saving
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Error saving payslip: " + err.message);
        } finally {
            setIsSubmitting(false); // Unlocks the button
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Payslip</h1>
                            <p className="text-muted-foreground">Fill in the employee details and compensation information</p>
                        </div>
                        <Button variant="outline" asChild>
                            <button onClick={() => navigate("/payslipUI")}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Payslip List
                            </button>
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Employee Information Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Employee Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Employee Name *</label>
                                        <Input
                                            type="text"
                                            value={employeeName || ""}
                                            placeholder="Enter Employee Name"
                                            onChange={(e) => setEmployeeName(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Employee ID *</label>
                                        <Input
                                            type="text"
                                            value={employeeId || ""}
                                            placeholder="Enter Employee ID"
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Designation *</label>
                                        <Input
                                            type="text"
                                            value={designation || ""}
                                            placeholder="Enter Designation"
                                            onChange={(e) => setDesignation(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Basic Pay *</label>
                                        <Input
                                            type="text"
                                            value={basicPay === 0 ? "" : basicPay}
                                            placeholder="Enter Base Salary"
                                            onChange={(e) => setBasicPay(e.target.value.replace(/[^0-9.]/g, ""))}
                                            {...inputModeProps}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Period Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Payment Period
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Start Date *</label>
                                        <Input
                                            type="date"
                                            value={startDate || ""}
                                            onChange={handleStartDateChange}
                                            required
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">End Date *</label>
                                        <Input
                                            type="date"
                                            value={endDate || ""}
                                            onChange={handleEndDateChange}
                                            min={startDate}
                                            disabled={!startDate}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statutory Deductions Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Statutory Deductions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {statutoryDeductions.map((deduction, index) => (
                                    <div key={index} className="flex gap-3 items-end">
                                        <div className="flex-2 space-y-2">
                                            <label className="text-sm font-medium text-foreground">Deduction Type</label>
                                            <select
                                                value={deduction.name}
                                                onChange={(e) => {
                                                    const updated = statutoryDeductions.map((item, i) =>
                                                        i === index ? { ...item, name: e.target.value } : item
                                                    );
                                                    setStatutoryDeductions(updated);
                                                }}
                                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="" disabled>Select Deduction</option>
                                                {statutoryDeductionsOptions.map((option, idx) => (
                                                    <option
                                                        key={idx}
                                                        value={option}
                                                        disabled={statutoryDeductions.some((d) => d.name === option && d.name !== deduction.name)}
                                                    >
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium text-foreground">Amount</label>
                                            <Input
                                                type="text"
                                                placeholder="0.00"
                                                value={deduction.amount === 0 ? "" : deduction.amount}
                                                onChange={(e) => {
                                                    const updated = statutoryDeductions.map((item, i) =>
                                                        i === index ? { ...item, amount: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0 } : item
                                                    );
                                                    setStatutoryDeductions(updated);
                                                }}
                                                {...inputModeProps}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                const updated = statutoryDeductions.filter((_, i) => i !== index);
                                                setStatutoryDeductions(updated);
                                            }}
                                            title="Remove deduction"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStatutoryDeductions([...statutoryDeductions, { name: "", amount: 0 }])}
                                    disabled={statutoryDeductions.length >= statutoryDeductionsOptions.length}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Statutory Deduction
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Other Deductions Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Other Deductions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {otherDeductions.map((deduction, index) => (
                                    <div key={index} className="flex gap-3 items-end">
                                        <div className="flex-2 space-y-2">
                                            <label className="text-sm font-medium text-foreground">Deduction Type</label>
                                            {deduction.name !== "Custom" ? (
                                                <select
                                                    value={deduction.name}
                                                    onChange={(e) => {
                                                        const updated = otherDeductions.map((item, i) =>
                                                            i === index ? { ...item, name: e.target.value } : item
                                                        );
                                                        setOtherDeductions(updated);
                                                    }}
                                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <option value="" disabled>Select Deduction</option>
                                                    {otherDeductionsOptions.map((option, idx) => (
                                                        <option
                                                            key={idx}
                                                            value={option}
                                                            disabled={otherDeductions.some((d) => d.name === option && d.name !== deduction.name)}
                                                        >
                                                            {option}
                                                        </option>
                                                    ))}
                                                    <option value="Custom">Other (Specify)</option>
                                                </select>
                                            ) : (
                                                <Input
                                                    type="text"
                                                    placeholder="Specify Custom Deduction"
                                                    value={deduction.customName || ""}
                                                    onChange={(e) => {
                                                        const updated = otherDeductions.map((item, i) =>
                                                            i === index ? { ...item, customName: e.target.value } : item
                                                        );
                                                        setOtherDeductions(updated);
                                                    }}
                                                    onBlur={() => {
                                                        if (!deduction.customName) {
                                                            const updated = otherDeductions.map((item, i) =>
                                                                i === index ? { ...item, name: "Custom" } : item
                                                            );
                                                            setOtherDeductions(updated);
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium text-foreground">Amount</label>
                                            <Input
                                                type="text"
                                                placeholder="0.00"
                                                value={deduction.amount === 0 ? "" : deduction.amount}
                                                onChange={(e) => {
                                                    const updated = otherDeductions.map((item, i) =>
                                                        i === index ? { ...item, amount: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0 } : item
                                                    );
                                                    setOtherDeductions(updated);
                                                }}
                                                {...inputModeProps}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                const updated = otherDeductions.filter((_, i) => i !== index);
                                                setOtherDeductions(updated);
                                            }}
                                            title="Remove deduction"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOtherDeductions([...otherDeductions, { name: "", amount: 0 }])}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Other Deduction
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Additional Compensation Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Additional Compensation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Honorarium</label>
                                        <Input
                                            type="text"
                                            value={honorarium === 0 ? "" : honorarium}
                                            placeholder="0.00"
                                            onChange={(e) => setHonorarium(e.target.value.replace(/[^0-9.]/g, ""))}
                                            {...inputModeProps}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Allowance</label>
                                        <Input
                                            type="text"
                                            value={allowance === 0 ? "" : allowance}
                                            placeholder="0.00"
                                            onChange={(e) => setAllowance(e.target.value.replace(/[^0-9.]/g, ""))}
                                            {...inputModeProps}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5" />
                                    Pay Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Total Pay After Deductions</label>
                                        <Input
                                            type="number"
                                            readOnly
                                            value={isNaN(totalPay) ? "" : totalPay}
                                            className="bg-muted cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Net Pay</label>
                                        <Input
                                            type="number"
                                            readOnly
                                            value={isNaN(netPay) ? "" : netPay}
                                            className="bg-muted cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                {isSubmitting ? "Saving..." : "Save Payslip"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/payslipUI")}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PayslipForm;

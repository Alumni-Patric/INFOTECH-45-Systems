import React, { useState } from 'react';
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import { collection, setDoc, getDocs, doc } from "firebase/firestore";
import { firestore } from "../firebase.js";
import toast, { Toaster } from 'react-hot-toast';

const PayslipForm = () => {
    const [employeeName, setEmployeeName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [designation, setDesignation] = useState("");
    const [dateOfJoining, setDateOfJoining] = useState("");
    const [salaryMonth, setSalaryMonth] = useState("");
    const [basicPay, setBasicPay] = useState(0);
    const [statutoryDeductions, setStatutoryDeductions] = useState([]);
    const [otherDeductions, setOtherDeductions] = useState([]);
    const [honorarium, setHonorarium] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const [paymentDate, setPaymentDate] = useState("");

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
        dateOfJoining !== "" &&
        salaryMonth !== "" &&
        parseFloat(basicPay) > 0 &&
        paymentDate !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                employeeName: employeeName || "",
                employeeId: employeeId || "",
                designation: designation || "",
                dateOfJoining: dateOfJoining || "",
                salaryMonth: salaryMonth || "",
                basicPay: parseFloat(basicPay) || 0,
                statutoryDeductions,
                otherDeductions,
                honorarium: parseFloat(honorarium) || 0,
                allowance: parseFloat(allowance) || 0,
                totalPay,
                netPay,
                paymentDate: paymentDate || "",
                status: "Pending",
                createdAt: new Date().toISOString(),
                timestamp: new Date(),
            });

            toast.dismiss(loadingToast);
            toast.success("Payslip saved successfully!");

            // Clear all form fields
            setEmployeeName("");
            setEmployeeId("");
            setDesignation("");
            setDateOfJoining("");
            setSalaryMonth("");
            setBasicPay(0);
            setStatutoryDeductions([]);
            setOtherDeductions([]);
            setHonorarium(0);
            setAllowance(0);
            setPaymentDate("");

            // Scroll to top after a short delay to ensure DOM has updated
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Error saving payslip: " + err.message);
        }
    };

    return (
        <>
            <Navbar />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <div className="p-10">

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 p-5 border border-gray-300 rounded-lg bg-gray-50">
                    <h1 className="text-center mb-5 text-2xl font-bold">Payslip Form</h1>
                    {/* Employee Name and Date of Joining */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Employee Name:</label>
                            <input
                                type="text"
                                value={employeeName || ""}
                                onChange={(e) => setEmployeeName(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Date of Joining:</label>
                            <input
                                type="date"
                                value={dateOfJoining || ""}
                                onChange={(e) => setDateOfJoining(e.target.value)}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                    </div>

                    {/* Employee ID and Salary Month */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Employee ID:</label>
                            <input
                                type="text"
                                value={employeeId || ""}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Salary Month:</label>
                            <input
                                type="month"
                                value={salaryMonth || ""}
                                onChange={(e) => setSalaryMonth(e.target.value)}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                    </div>

                    {/* Designation */}
                    <label className="font-bold block mb-1">Designation:</label>
                    <input
                        type="text"
                        value={designation || ""}
                        onChange={(e) => setDesignation(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                        className="w-full p-2 mb-4 rounded border border-gray-300"
                        required
                    />


                    {/* Basic Pay */}
                    <label className="font-bold block mb-1">Basic Pay:</label>
                    <input
                        type="text"
                        value={basicPay === 0 ? "" : basicPay}
                        onChange={(e) => setBasicPay(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        className="w-full p-2 mb-4 rounded border border-gray-300"
                        required
                    />

                    {/* Statutory Deductions */}
                    <label className="font-bold block mb-1">Statutory Deductions:</label>
                    {statutoryDeductions.map((deduction, index) => (
                        <div key={index} className="flex gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Name"
                                value={deduction.name}
                                onChange={(e) => {
                                    const updated = statutoryDeductions.map((item, i) =>
                                        i === index ? { ...item, name: e.target.value } : item
                                    );
                                    setStatutoryDeductions(updated);
                                }}
                                className="flex-2 w-full p-2 mb-4 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                placeholder="Amount"
                                value={deduction.amount === 0 ? "" : deduction.amount}
                                onChange={(e) => {
                                    const updated = statutoryDeductions.map((item, i) =>
                                        i === index ? { ...item, amount: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0 } : item
                                    );
                                    setStatutoryDeductions(updated);
                                }}
                                {...inputModeProps}
                                className="flex-1 w-full p-2 mb-4 rounded border border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = statutoryDeductions.filter((_, i) => i !== index);
                                    setStatutoryDeductions(updated);
                                }}
                                className="px-3 py-2 mb-4 border-none rounded cursor-pointer bg-red-500 text-white hover:bg-red-600 text-sm"
                                title="Remove deduction"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setStatutoryDeductions([...statutoryDeductions, { name: "", amount: 0 }])}
                        className="px-5 py-2 mr-3 border-none rounded cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Add Deduction
                    </button>

                    {/* Other Deductions */}
                    <label className="font-bold block mb-1">Other Deductions:</label>
                    {otherDeductions.map((deduction, index) => (
                        <div key={index} className="flex gap-3 mb-3">
                            <input
                                type="text"
                                placeholder="Name"
                                value={deduction.name}
                                onChange={(e) => {
                                    const updated = otherDeductions.map((item, i) =>
                                        i === index ? { ...item, name: e.target.value } : item
                                    );
                                    setOtherDeductions(updated);
                                }}
                                className="flex-2 w-full p-2 mb-4 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                placeholder="Amount"
                                value={deduction.amount === 0 ? "" : deduction.amount}
                                onChange={(e) => {
                                    const updated = otherDeductions.map((item, i) =>
                                        i === index ? { ...item, amount: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0 } : item
                                    );
                                    setOtherDeductions(updated);
                                }}
                                {...inputModeProps}
                                className="flex-1 w-full p-2 mb-4 rounded border border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = otherDeductions.filter((_, i) => i !== index);
                                    setOtherDeductions(updated);
                                }}
                                className="px-3 py-2 mb-4 border-none rounded cursor-pointer bg-red-500 text-white hover:bg-red-600 text-sm"
                                title="Remove deduction"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setOtherDeductions([...otherDeductions, { name: "", amount: 0 }])}
                        className="px-5 py-2 mr-3 border-none rounded cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Add Other Deduction
                    </button>

                    {/* Calculated Total Pay */}
                    <label className="font-bold block mb-1">Total Pay After Deductions:</label>
                    <input
                        type="number"
                        readOnly
                        value={isNaN(totalPay) ? "" : totalPay}
                        className="w-full p-2 mb-4 rounded border border-gray-300 bg-gray-100 cursor-not-allowed"
                        disabled
                    />

                    {/* Honorarium */}
                    <label className="font-bold block mb-1">Honorarium:</label>
                    <input
                        type="text"
                        value={honorarium === 0 ? "" : honorarium}
                        onChange={(e) => setHonorarium(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        className="w-full p-2 mb-4 rounded border border-gray-300"
                    />

                    {/* Allowance */}
                    <label className="font-bold block mb-1">Allowance:</label>
                    <input
                        type="text"
                        value={allowance === 0 ? "" : allowance}
                        onChange={(e) => setAllowance(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        className="w-full p-2 mb-4 rounded border border-gray-300"
                    />

                    {/* Net Pay */}
                    <label className="font-bold block mb-1">Net Pay:</label>
                    <input
                        type="number"
                        readOnly
                        value={isNaN(netPay) ? "" : netPay}
                        className="w-full p-2 mb-4 rounded border border-gray-300 bg-gray-100 cursor-not-allowed"
                        disabled
                    />
                    {/* Payment Date */}
                    <label className="font-bold block mb-1">Payment Date:</label>
                    <input
                        type="date"
                        value={paymentDate || ""}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full p-2 mb-4 rounded border border-gray-300"
                        required
                    />
                    {/* Buttons */}
                    <div className="mt-5">
                        <button type="submit" disabled={!isFormValid} className="px-5 py-2 mr-3 border-none rounded cursor-pointer bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            Save Payslip
                        </button>
                        <button
                            type="button"
                            onClick={() => (window.location.href = "/payslipUI")}
                            className="px-5 py-2 mr-3 border-none rounded cursor-pointer bg-gray-500 text-white hover:bg-gray-600"
                        >
                            Return to Payslip Home
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PayslipForm;

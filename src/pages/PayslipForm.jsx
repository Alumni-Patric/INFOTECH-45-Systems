import React, { useState } from 'react';
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import { collection, setDoc, getDocs, doc } from "firebase/firestore";
import { firestore } from "../firebase.js";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

    {/* Function to format the date range for the payslip */}
    const getFormattedDate = (startDate, endDate) => {
        if(!startDate || !endDate) return "";

        const start = new Date(startDate);
        const end = new Date(endDate);

        if(end < start) {
            toast.error("End date cannot be earlier than start date.");
            return;
        }

        const sameMonth = start.getMonth() === end.getMonth();
        const sameYear = start.getFullYear() === end.getFullYear();

        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(start);

        if(sameMonth && sameYear) {
            return `${monthName} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
        }else{
            const startFormatted = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(start);
            const endFormatted = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(end);
            return `${startFormatted} - ${endFormatted}`;
        }
    }

    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        setStartDate(selectedDate);

        // If end date is not set or is before the start date, reset it
        if (endDate && new Date(endDate) < new Date(selectedDate)) {
            setEndDate("");
        }
    };

    {/* Function to handle end date change to not surpass the start date*/}
    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        if(new Date(selectedDate) < new Date(startDate)) {
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
                Statutory_Deductions:statutoryDeductions,
                Other_Deductions: otherDeductions,
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
        }finally{
            setIsSubmitting(false); // Unlocks the button
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
                                placeholder='Enter Employee Name'
                                onChange={(e) => setEmployeeName(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Employee ID:</label>
                            <input
                                type="text"
                                value={employeeId || ""}
                                placeholder='Enter Employee ID'
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                        
                    </div>

                    {/* Pay Period (Start and End)*/}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Start Date:</label>
                            <input
                                type="date"
                                value={startDate || ""}
                                onChange={handleStartDateChange}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                                disabled
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-bold block mb-1">End Date:</label>
                            <input
                                type="date"
                                value={endDate || ""}
                                onChange={handleEndDateChange}
                                min={startDate}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                disabled={!startDate} // Disable if start date is not set
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            {/* Designation */}
                            <label className="font-bold block mb-1">Designation:</label>
                            <input
                                type="text"
                                value={designation || ""}
                                placeholder='Enter Designation'
                                onChange={(e) => setDesignation(e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-bold block mb-1">Basic Pay:</label>
                            <input
                                type="text"
                                value={basicPay === 0 ? "" : basicPay}
                                placeholder='Enter Base Salary'
                                onChange={(e) => setBasicPay(e.target.value.replace(/[^0-9.]/g, ""))}
                                {...inputModeProps}
                                className="w-full p-2 mb-4 rounded border border-gray-300"
                                required
                            />
                        </div>
                    </div>

                    

                    {/* Statutory Deductions */}
                    <label className="font-bold block mb-1">Statutory Deductions:</label>
                    {statutoryDeductions.map((deduction, index) => (
                        <div key={index} className="flex gap-3">
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
                        className="px-5 py-2 mb-3 border-none rounded cursor-pointer bg-[#022073] text-white hover:bg-blue-800"
                    >
                        Add Deduction
                    </button>

                    {/* Other Deductions */}
                    <label className="font-bold block mb-1">Other Deductions:</label>
                    {otherDeductions.map((deduction, index) => (
                        <div key={index} className="flex gap-3">
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
                        className="px-5 py-2 mb-3 border-none rounded cursor-pointer bg-[#022073] text-white hover:bg-blue-800"
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
                        placeholder="0"
                        onChange={(e) => setHonorarium(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        className="w-full p-2 mb-4 rounded border border-gray-300"
                    />

                    {/* Allowance */}
                    <label className="font-bold block mb-1">Allowance:</label>
                    <input
                        type="text"
                        value={allowance === 0 ? "" : allowance}
                        placeholder='0'
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
                    {/* Buttons */}
                    <div className="mt-5">
                        <button 
                            type="submit" 
                            disabled={!isFormValid || isSubmitting} 
                            className="px-5 py-2 mr-3 border-none rounded cursor-pointer bg-[#022073] text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? "Saving..." : "Save Payslip"}
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

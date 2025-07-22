import React, { useState } from 'react';
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import { collection, setDoc,getDocs, doc } from "firebase/firestore";
import { firestore } from "../firebase.js";

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
        parseFloat(basicPay) > 0 ||
        calculateTotal(statutoryDeductions) > 0 ||
        calculateTotal(otherDeductions) > 0 ||
        parseFloat(honorarium) > 0 ||
        parseFloat(allowance) > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            alert("Please fill in at least one field before submitting.");
            return;
        }
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
            });
    
            alert("Payslip saved!");
        } catch (err) {
            alert("Error saving payslip: " + err.message);
        }
    };

    const formStyle = {
        maxWidth: "600px",
        margin: "auto",
        marginTop: "40px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
    };

    const labelStyle = { fontWeight: "bold", display: "block", marginBottom: "5px" };
    const inputStyle = { width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" };
    const rowStyle = { display: "flex", gap: "10px", marginBottom: "10px" };
    const btnStyle = { padding: "10px 20px", marginRight: "10px", border: "none", borderRadius: "4px", cursor: "pointer", backgroundColor: "#007bff", color: "#fff" };

    return (
        <>
            <Navbar />
            <div style={{ padding: "40px" }}>
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h1 style={{ textAlign: "center", marginBottom: "20px", marginLeft: 0 }}>Payslip Form</h1>
                    {/* Employee Name and Date of Joining */}
                    <div style={rowStyle}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Employee Name:</label>
                            <input
                            type="text"
                            value={employeeName || ""}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Date of Joining:</label>
                            <input
                            type="date"
                            value={dateOfJoining || ""}
                            onChange={(e) => setDateOfJoining(e.target.value)}
                            style={inputStyle}
                            />
                        </div>
                    </div>
                
                        {/* Employee ID and Salary Month */}
                    <div style={rowStyle}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Employee ID:</label>
                            <input
                            type="text"
                            value={employeeId || ""}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Salary Month:</label>
                            <input
                            type="month"
                            value={salaryMonth || ""}
                            onChange={(e) => setSalaryMonth(e.target.value)}
                            style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Designation */}
                    <label style={labelStyle}>Designation:</label>
                    <input

                        type="text"
                        value={designation || ""}   
                        onChange={(e) => setDesignation(e.target.value)}
                        style={inputStyle}
                    />

                    
                    {/* Basic Pay */}
                    <label style={labelStyle}>Basic Pay:</label>
                    <input
                        type="text"
                        value={basicPay === 0 ? "" : basicPay}
                        onChange={(e) => setBasicPay(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        style={inputStyle}
                    />

                    {/* Statutory Deductions */}
                    <label style={labelStyle}>Statutory Deductions:</label>
                    {statutoryDeductions.map((deduction, index) => (
                        <div key={index} style={rowStyle}>
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
                                style={{ ...inputStyle, flex: 2 }}
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
                                style={{ ...inputStyle, flex: 1 }}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setStatutoryDeductions([...statutoryDeductions, { name: "", amount: 0 }])}
                        style={btnStyle}
                    >
                        Add Deduction
                    </button>

                    {/* Other Deductions */}
                    <label style={labelStyle}>Other Deductions:</label>
                    {otherDeductions.map((deduction, index) => (
                        <div key={index} style={rowStyle}>
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
                                style={{ ...inputStyle, flex: 2 }}
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
                                style={{ ...inputStyle, flex: 1 }}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setOtherDeductions([...otherDeductions, { name: "", amount: 0 }])}
                        style={btnStyle}
                    >
                        Add Other Deduction
                    </button>

                    {/* Calculated Total Pay */}
                    <label style={labelStyle}>Total Pay After Deductions:</label>
                    <input
                        type="number"
                        readOnly
                        value={isNaN(totalPay) ? "" : totalPay}
                        style={inputStyle}
                    />

                    {/* Honorarium */}
                    <label style={labelStyle}>Honorarium:</label>
                    <input
                        type="text"
                        value={honorarium === 0 ? "" : honorarium}
                        onChange={(e) => setHonorarium(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        style={inputStyle}
                    />

                    {/* Allowance */}
                    <label style={labelStyle}>Allowance:</label>
                    <input
                        type="text"
                        value={allowance === 0 ? "" : allowance}
                        onChange={(e) => setAllowance(e.target.value.replace(/[^0-9.]/g, ""))}
                        {...inputModeProps}
                        style={inputStyle}
                    />

                    {/* Net Pay */}
                    <label style={labelStyle}>Net Pay:</label>
                    <input
                        type="number"
                        readOnly
                        value={isNaN(netPay) ? "" : netPay}
                        style={inputStyle}
                    />
                    {/* Payment Date */}
                    <label style={labelStyle}>Payment Date:</label>
                    <input
                        type="date"
                        value={paymentDate || ""}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        style={inputStyle}
                    />
                    {/* Buttons */}
                    <div style={{ marginTop: "20px" }}>
                        <button type="submit" disabled={!isFormValid} style={btnStyle}>
                            Save Payslip
                        </button>
                        <button
                            type="button"
                            onClick={() => (window.location.href = "/payslipUI")}
                            style={{ ...btnStyle, backgroundColor: "#6c757d" }}
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

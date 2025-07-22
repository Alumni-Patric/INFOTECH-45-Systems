import React, { useEffect, useState } from "react";
import "../css/payslip.css";
import Navbar from '../NewNavbar&Footer/navbar';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase.js";
import { useParams } from "react-router-dom";

const Payslip = () => {
  const { id } = useParams(); // Get document ID from URL
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        const docRef = doc(firestore, "Payslip", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          console.error("No such payslip found!");
        }
      } catch (error) {
        console.error("Error fetching payslip:", error);
      }
    };

    fetchPayslip();
  }, [id]);

  if (!data) return <div>Loading...</div>;

  const totalStatutory = data.statutoryDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalOther = data.otherDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0;

  return (
    <>
      <Navbar />
      <div className="payslip-container">
        <div className="payslip-header">
          <h1 id="company-name">Company Name</h1>
          <h2>PAYSLIP</h2>
        </div>

        <div className="employee-details">
          <div>
            <p><strong>Employee Name:</strong> {data.employeeName}</p>
            <p><strong>Designation:</strong> {data.designation}</p>
            </div>
          <div>
            <p><strong>Employee ID:</strong> {data.employeeId}</p>
            <p><strong>Date of Joining:</strong> {data.dateOfJoining}</p>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">Earnings</div>
          <div className="table-row">Basic Pay: {data.basicPay} PHP</div>
          <div className="table-row">Honorarium: {data.honorarium} PHP</div>
          <div className="table-row">Allowance: {data.allowance} PHP</div>
          <div className="table-footer">Total Pay: {data.totalPay} PHP</div>
        </div>

        <div className="table-container">
          <div className="table-header">Statutory Deductions</div>
          {data.statutoryDeductions?.map((ded, idx) => (
            <div className="table-row" key={idx}>{ded.name}: {ded.amount} PHP</div>
          ))}
          <div className="table-footer">Total Statutory Deductions: {totalStatutory} PHP</div>
        </div>

        <div className="table-container">
          <div className="table-header">Other Deductions</div>
          {data.otherDeductions?.map((ded, idx) => (
            <div className="table-row" key={idx}>{ded.name}: {ded.amount} PHP</div>
          ))}
          <div className="table-footer">Total Other Deductions: {totalOther} PHP</div>
        </div>

        <div className="net-salary">
          Net Salary: {data.netPay} PHP
        </div>

        <button
          type="button"
          onClick={() => window.location.href = "/payslipUI"}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Return to Payslip Home
        </button>
      </div>
    </>
  );
};

export default Payslip;

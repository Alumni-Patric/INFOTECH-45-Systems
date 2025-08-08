import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Adjust the import path as necessary
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const PayrollSlip = () => {
  const { payslipId } = useParams(); // Get the payslip ID from the URL parameters
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayslipData = async () => {
      try{
        const docRef = doc(firestore, "Payslip", payslipId); // Replace 'payslipId' with the actual ID of the payslip document
        console.log("Fetching payslip data for ID:", docRef.path);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Payslip data:", docSnap.data());
          setPayslipData(docSnap.data());
        }else{
          console.error("Payslip document not found");
        }

      }catch(error){
        console.error("Error fetching payslip data:", error);
      }finally{
        setLoading(false);
      }
    };

    fetchPayslipData();
    
  }, [payslipId]);

  if(loading){
    return <div>Loading...</div>;
  }

  const totalStatutoryDeductions = payslipData.Statutory_Deductions.reduce((acc, item) => acc + parseFloat(item.amount), 0);
  const totalOtherDeductions = payslipData.Other_Deductions.reduce((acc, item) => acc + parseFloat(item.amount), 0);
  const totalDeductions = totalStatutoryDeductions + totalOtherDeductions;
  const totalPayAfterDeductions = parseFloat(payslipData.Basic_Pay - totalDeductions);

  const honorarium = parseFloat(payslipData.Honorarium || 0); // Default to 0 if honorarium is not provided
  const allowance = parseFloat(payslipData.Allowance || 0); // Default to 0 if allowance is not provided
  const netPay = totalPayAfterDeductions + honorarium + allowance;

  const handlePrint = () => {
    window.print();
  }

  return (
    <>
    <Navbar  className="site-navbar"/>
    <div className="print-area max-w-xl mx-auto border border-black font-sans text-sm mt-5 mb-5">

      <table className="w-full border text-sm">
        <thead> 
          <tr>
            <td className="border px-2 py-1 text-center" colSpan={2}>
              <p className="font-bold text-lg">Galanter & Jones S E A Inc.</p>
              <p>JBT Building Romero Rd., Junob, Dumaguete City</p>
              <p>(035) 523-3414 / +63 9357746427</p>
            </td>
          </tr>
          <tr className="bg-[#EEECE1]">
            <th className="border px-2 py-1 text-center" colSpan={2}>
              <p className="font-bold text-[20px]">Payroll Slip</p>
            </th>
          </tr>
          <tr>
            <th className="border px-2 py-1 text-center" colSpan={2}>
              <p className="font-bold italic">PAY PERIOD: {payslipData.Payment_Period} </p>
            </th>
          </tr>
          <tr>
            <th className="border px-2 py-1 text-left" colSpan={2}>
              <p>EMPLOYEE NAME: {payslipData.Employee_Name}</p>
              <p>DESIGNATION: {payslipData.Designation}</p>
            </th>
          </tr>  
        </thead>

        <tbody>
          <tr className="bg-[#EEECE1]">
            <th className="border px-2 py-1 text-left">Earnings: </th>
            <th className="border px-2 py-1 text-center">Amount</th>
          </tr>
          <tr>
            <td className="border px-2 py-1">Basic Pay</td>
            <td className="border px-2 py-1 text-right">{parseFloat(payslipData.Basic_Pay).toFixed(2)}</td>
          </tr>

          {/*Statutory Deductions */}
          <tr>
            <td className="border px-2 py-1 font-semibold bg-[#EEECE1]">Statutory Deductions</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          {payslipData.Statutory_Deductions.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1 text-right">{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))}

          {/*Other Deductions*/}
          <tr>
            <td className="border px-2 py-1 font-semibold bg-[#D9D9D9]">Other Deductions:</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          {payslipData.Other_Deductions.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1 text-right">{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))} 
          <tr className="font-semibold bg-[#D9D9D9]">
            <td className="border px-2 py-1">Total pay after Deductions</td>
            <td className="border px-2 py-1 text-right">{totalPayAfterDeductions.toFixed(2)}</td>
          </tr>
          <tr className="font-semibold">
            <td className="border px-2 py-1">ADD:</td>
            <td className="border px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border px-2 py-1">Honorarium</td>
            <td className="border px-2 py-1 text-right">{honorarium ? honorarium.toFixed(2) : ""}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">Allowance</td>
            <td className="border px-2 py-1 text-right">{allowance ? allowance.toFixed(2): ""}</td>
          </tr>
          <tr className="font-bold bg-[#D9D9D9]">
            <td className="border px-2 py-1">Net Pay</td>
            <td className="border px-2 py-1 text-right">{netPay.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-col gap-4 mt-4 text-sm">
        <div className="border-b-1 px-3">
          <p> Prepared By: </p>
          <p className="font-semibold">HR PERSONNEL</p>
        </div>
        <div className="px-3">
          <p> Reviewed By:</p>
          <p className="font-semibold">ACCOUNTANT</p>
        </div>
        <div>
          <p className="px-3"> Approved By: </p>
          <div className="flex px-3 border-t-1 justify-between items-center">
            <p className="font-semibold">BUSINESS MANAGER</p>
            <p className="font-semibold">Signature Over Printed Name</p>
          </div>
        </div>
      </div>

      <div className="text-right pr-50 pt-3 text-sm">
        <p><span className="font-semibold">Date: </span></p>
      </div>
    </div>
    
    {/*Buttons Section*/}
    <div className="flex justify-between max-w-xl mx-auto mt-4 mb-4">
      <button 
        className="px-30 py-2 border-none rounded cursor-pointer bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => navigate('/payslipUI')}
        >
          Go Back
        </button>
      <button 
        className="px-30 py-2 border-none rounded cursor-pointer bg-[#022073] text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePrint}
        >
          Print
        </button>
    </div>
    <Footer className="site-foother"/>
    </>
  );
};

export default PayrollSlip;

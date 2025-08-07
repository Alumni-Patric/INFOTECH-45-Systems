import React from "react";
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";

const PayrollSlip = () => {
  
  
  return (
    <>
    <Navbar />
    <div className="max-w-xl mx-auto border border-black font-sans text-sm mt-5 mb-5">

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
              <p className="font-bold italic">PAY PERIOD:</p>
            </th>
          </tr>
          <tr>
            <th className="border px-2 py-1 text-left" colSpan={2}>
              <p>EMPLOYEE NAME:</p>
              <p>DESIGNATION:</p>
            </th>
          </tr>  
        </thead>

        <tbody>
          <tr className="bg-[#EEECE1]">
            <th className="border px-2 py-1 text-left">Earnings:</th>
            <th className="border px-2 py-1 text-center">Amount</th>
          </tr>
          <tr>
            <td className="border px-2 py-1">Basic Pay</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-semibold bg-[#EEECE1]">Statutory Deductions</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          {/* {deductions.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1 text-right">{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))} */}
          <tr>
            <td className="border px-2 py-1 font-semibold bg-[#D9D9D9]">Other Deductions:</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          {/* {otherDeductions.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">{item.name}</td>
              <td className="border px-2 py-1 text-right">{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))} */}
          <tr className="font-semibold">
            <td className="border px-2 py-1">Total pay after Deductions</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          <tr className="font-semibold">
            <td className="border px-2 py-1">ADD:</td>
            <td className="border px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border px-2 py-1">Honorarium</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          <tr>
            <td className="border px-2 py-1">Allowance</td>
            <td className="border px-2 py-1 text-right"></td>
          </tr>
          <tr className="font-bold bg-[#D9D9D9]">
            <td className="border px-2 py-1">Net Pay</td>
            <td className="border px-2 py-1 text-right"></td>
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
    <Footer />
    </>
  );
};

export default PayrollSlip;

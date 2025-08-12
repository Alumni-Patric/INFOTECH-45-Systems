import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase.js";
import Navbar from '../NewNavbar&Footer/navbar';
import Footer from '../NewNavbar&Footer/footer';
import Logo from '../assets/logo.png';

function PaymentVoucherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState(null);
  const [accountingData, setAccountingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVoucherData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment voucher data
      const paymentSnapshot = await getDocs(collection(firestore, "Payment Voucher"));
      const paymentData = paymentSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.PV_NO === id;
      });

      if (paymentData) {
        setVoucherData(paymentData.data());
        
        // Extract the document ID to find corresponding accounting data
        const docId = paymentData.id;
        const accountingDocId = docId.replace('Payment-', 'Accounting-');
        
        // Fetch accounting data
        const accountingDoc = await getDoc(doc(firestore, "Payment Voucher", accountingDocId));
        if (accountingDoc.exists()) {
          const accountingInfo = accountingDoc.data();
          setAccountingData(accountingInfo.Accounts || []);
        }
      }
    } catch (error) {
      console.error("Error fetching voucher data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/payment-voucher-table');
  };

  if (loading) {
    return (
      <>
        <div className="print:hidden">
          <Navbar />
        </div>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl text-gray-600">Loading payment voucher...</div>
        </div>
        <div className="print:hidden">
          <Footer />
        </div>
      </>
    );
  }

  if (!voucherData) {
    return (
      <>
        <div className="print:hidden">
          <Navbar />
        </div>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl text-red-600">Payment voucher not found</div>
        </div>
        <div className="print:hidden">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-lg border border-gray-300 mt-16 mb-16 p-8 rounded-lg print:shadow-none print:border-2 print:border-black print:rounded-none print:mt-0 print:mb-0 print:max-w-none print:mx-0 print:p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-black">
          {/* Company Info */}
          <div className="flex items-center">
            <div className="w-16 h-16 border-2 border-black flex items-center justify-center mr-4 text-2xl">
              <img src={Logo} alt="Company Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-lg">Galanter & Jones SLA. Inc.</div>
              <div className="text-sm italic text-gray-600">Heated Outdoor Furniture</div>
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Payment Voucher</h1>
          </div>
          
          {/* Voucher Numbers */}
          <div className="text-right">
            <div className="mb-3">
              <span className="font-bold">PV No: </span>
              <span className="border-b border-black px-2 py-1 inline-block min-w-[120px]">
                {voucherData.PV_NO || ''}
              </span>
            </div>
            <div>
              <span className="font-bold">RFP No: </span>
              <span className="border-b border-black px-2 py-1 inline-block min-w-[120px]">
                {voucherData.RFP_NO || ''}
              </span>
            </div>
          </div>
        </div>

        {/* Payee Section */}
        <div className="mb-6">
          <div className="flex items-center">
            <span className="font-bold mr-4 min-w-[80px]">Payee:</span>
            <span className="border-b border-black flex-1 ml-10 px-2 py-1">
              {voucherData.Name || ''}
            </span>
          </div>
        </div>

        {/* Total Amount Section */}
        <div className="mb-6">
          <div className="flex items-center">
            <span className="font-bold mr-4 min-w-[120px]">Total Amount:</span>
            <span className="border-b border-black flex-1 px-2 py-1">
              {voucherData.Amount ? `₱${Number(voucherData.Amount).toLocaleString()}` : ''}
            </span>
          </div>
        </div>

        {/* Purpose Section */}
        <div className="mb-8">
          <div className="flex items-center">
            <span className="font-bold mr-4 min-w-[80px]">Purpose:</span>
            <span className="border-b border-black flex-1 ml-10 px-2 py-1">
              {voucherData.Purpose || ''}
            </span>
          </div>
        </div>

        {/* Signature Section */}
        <div className="flex w-max justify-between mb-8 space-x-67">
          {/* Paid By */}
          <div className="w-80">
            <div className="mb-2">
              <span className="font-bold">Paid by:</span>
            </div>
            <div className="flex justify-center">
              <div className="mb-2">
                <span className="font-bold">Treasurer</span>
              </div>
              <div className="border-b border-black w-100 ml-16 mb-2">
                {voucherData.Paid_By || ''}
              </div>
            </div>
            <div className="text-sm italic text-center ml-30">
              (Signature over printed name)
            </div>
          </div>
          
          {/* Date Paid */}
          <div className="w-60">
            <div className="mb-2">
              <span className="font-bold">Date Paid:</span>
            </div>
            <div className="border-b border-black px-2 py-1 text-center">
              {voucherData.Date_Paid || ''}
            </div>
          </div>
        </div>

        {/* Check Information */}
        <div className="flex gap-8 mb-8">
          <div className="flex items-center">
            <span className="font-bold mr-4">Check #:</span>
            <span className="border-b border-black px-2 py-1 min-w-[150px]">
              {accountingData[0]?.Check_No || ''}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-4">Check Amount:</span>
            <span className="border-b border-black px-2 py-1 min-w-[150px]">
              {accountingData[0]?.Check_Amount ? `₱${Number(accountingData[0].Check_Amount).toLocaleString()}` : ''}
            </span>
          </div>
        </div>

        {/* Accounting Section Header */}
        <div className="bg-gray-100 text-center font-bold py-3 px-4 border border-black mb-4">
          TO BE FILLED UP BY BOOKKEEPER/ACCOUNTING PERSONNEL
        </div>

        {/* Accounting Table */}
        <table className="w-full border-collapse border border-black mb-8">
          <thead>
            <tr>
              <th className="border border-black px-4 py-2 bg-gray-50 font-bold text-center">
                Account No
              </th>
              <th className="border border-black px-4 py-2 bg-gray-50 font-bold text-center">
                Account Name:
              </th>
              <th className="border border-black px-4 py-2 bg-gray-50 font-bold text-center">
                Debit - Amount
              </th>
              <th className="border border-black px-4 py-2 bg-gray-50 font-bold text-center">
                Credit - Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Filled Rows */}
            {accountingData.map((account, index) => (
              <tr key={index}>
                <td className="border border-black px-4 py-3 text-center">
                  {account.Account_ID || ''}
                </td>
                <td className="border border-black px-4 py-3">
                  {account.Account_Name || ''}
                </td>
                <td className="border border-black px-4 py-3 text-center">
                  {account.Debit_Amount ? `₱${Number(account.Debit_Amount).toLocaleString()}` : ''}
                </td>
                <td className="border border-black px-4 py-3 text-center">
                  {account.Credit_Amount ? `₱${Number(account.Credit_Amount).toLocaleString()}` : ''}
                </td>
              </tr>
            ))}
            
            {/* Empty Rows */}
            {Array(Math.max(0, 3 - accountingData.length)).fill().map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border border-black px-4 py-3 h-12"></td>
                <td className="border border-black px-4 py-3"></td>
                <td className="border border-black px-4 py-3"></td>
                <td className="border border-black px-4 py-3"></td>
              </tr>
            ))}
            
            {/* Total Row */}
            <tr className="border-t-2 border-black">
              <td className="border border-black px-4 py-3 text-right font-bold" colSpan="2">
                Total:
              </td>
              <td className="border border-black px-4 py-3 border-b-2"></td>
              <td className="border border-black px-4 py-3 border-b-2"></td>
            </tr>
          </tbody>
        </table>

        {/* Bottom Signature Section */}
        <div className="flex justify-between">
          {/* Recorded By */}
          <div className="w-80">
            <div className="mb-2">
              <span className="font-bold">Recorded by:</span>
            </div>
            <div className="mb-2">
              <span className="font-bold">Bookkeeper/Accounting</span>
            </div>
            <div className="border-b border-black w-64 ml-50 mb-2"></div>
            <div className="text-sm italic w-64 text-center ml-49">
              (Signature over printed name)
            </div>
          </div>
          
          {/* Date Recorded */}
          <div className="w-60">
            <div className="mb-2">
              <span className="font-bold">Date Recorded:</span>
            </div>
            <div className="border-b border-black px-2 py-1 text-center">
              {accountingData[0]?.Date_Recorded || ''}
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden in Print */}
        <div className="flex gap-4 justify-end mt-8 print:hidden">
          <button 
            onClick={handleBack}
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 font-semibold"
          >
            Back to Table
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 font-semibold"
          >
            Print
          </button>
        </div>
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}

export default PaymentVoucherForm;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase.js";
import Navbar from '../NewNavbar&Footer/navbar';
import Footer from '../NewNavbar&Footer/footer';
import Logo from '../assets/logo.png';
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { ArrowLeft, Printer, FileText, User, Calendar, DollarSign, Calculator, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function PaymentVoucherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState(null);
  const [accountingData, setAccountingData] = useState([]);
  const [accountingMetadata, setAccountingMetadata] = useState({});
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
          console.log("Full accounting document:", accountingInfo);
          setAccountingData(accountingInfo.Accounts || []);
          setAccountingMetadata({
            Date_Recorded: accountingInfo.Date_Recorded,
            Recorded_By: accountingInfo.Recorded_By
          });
        }
      }
    } catch (error) {
      console.error("Error fetching voucher data:", error);
      toast.error("Error loading payment voucher data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleBack = () => {
    navigate('/payment-voucher-table');
  };

  // Calculate totals for Debit and Credit Amounts
  const totalDebitAmount = accountingData.reduce((acc, curr) => acc + (curr.Debit_Amount || 0), 0);
  const totalCreditAmount = accountingData.reduce((acc, curr) => acc + (curr.Credit_Amount || 0), 0);

  if (loading) {
    return (
      <>
        <div className="print:hidden">
          <Navbar />
        </div>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Loading payment voucher...</h3>
              <p className="text-muted-foreground text-center">
                Please wait while we fetch the voucher data
              </p>
            </CardContent>
          </Card>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Payment voucher not found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The requested payment voucher could not be located
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Table
              </Button>
            </CardContent>
          </Card>
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

      <div className="print min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header Section - Hidden in Print */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Voucher Details</h1>
              <p className="text-muted-foreground">View and print payment voucher information</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Table
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Payment Voucher Document */}
          <div className="print-area">
            <Card className="shadow-lg border-2 border-black print:shadow-none print:border-2 print:border-black print:rounded-none print:mt-0 print:mb-0 print:max-w-none print:mx-0">
              <CardContent className="p-8 print:p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-black">
                  {/* Company Info */}
                  <div className="flex items-center">
                    <div className="w-16 h-16 border-2 border-black flex items-center justify-center mr-4 text-2xl">
                      <img src={Logo} alt="Company Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Galanter & Jones SLA. Inc.</div>
                      <div className="text-sm italic text-muted-foreground">Heated Outdoor Furniture</div>
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
                <div className="bg-muted text-center font-bold py-3 px-4 border border-black mb-4">
                  TO BE FILLED UP BY BOOKKEEPER/ACCOUNTING PERSONNEL
                </div>

                {/* Accounting Table */}
                <div className="overflow-x-auto mb-8">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr>
                        <th className="border border-black px-4 py-2 bg-muted font-bold text-center">
                          Account No
                        </th>
                        <th className="border border-black px-4 py-2 bg-muted font-bold text-center">
                          Account Name:
                        </th>
                        <th className="border border-black px-4 py-2 bg-muted font-bold text-center">
                          Debit - Amount
                        </th>
                        <th className="border border-black px-4 py-2 bg-muted font-bold text-center">
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
                          <td className="border border-black px-4 py-3 text-center">
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
                      <tr>
                        <td className="px-4 py-3 text-right font-bold" colSpan="2">
                          Total:
                        </td>
                        <td className="border px-4 py-3 text-center">
                          {totalDebitAmount ? `₱${Number(totalDebitAmount).toLocaleString()}` : ''}
                        </td>
                        <td className=" px-4 py-3 text-center">
                          {totalCreditAmount ? `₱${Number(totalCreditAmount).toLocaleString()}` : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

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
                      {accountingMetadata.Date_Recorded || accountingData[0]?.Date_Recorded || ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}

export default PaymentVoucherForm;

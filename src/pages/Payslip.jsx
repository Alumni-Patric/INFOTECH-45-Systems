import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Adjust the import path as necessary
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { ArrowLeft, Printer, PenTool, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PayrollSlip = () => {
  const { payslipId } = useParams(); // Get the payslip ID from the URL parameters
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signatureDate, setSignatureDate] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingSignature, setPendingSignature] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayslipData = async () => {
      try {
        const docRef = doc(firestore, "Payslip", payslipId); // Replace 'payslipId' with the actual ID of the payslip document
        console.log("Fetching payslip data for ID:", docRef.path);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Payslip data:", docSnap.data());
          const data = docSnap.data();
          setPayslipData(data);

          // Load existing signature and date if they exist
          if (data.signature) {
            setSignature(data.signature);
          }
          if (data.signatureDate) {
            setSignatureDate(data.signatureDate);
          }
        } else {
          console.error("Payslip document not found");
          toast.error("Payslip not found");
        }

      } catch (error) {
        console.error("Error fetching payslip data:", error);
        toast.error("Error loading payslip");
      } finally {
        setLoading(false);
      }
    };

    fetchPayslipData();

  }, [payslipId]);

  // Set up canvas context when signature modal opens
  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Load existing signature if it exists
      if (signature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = signature;
      }
    }
  }, [showSignatureModal, signature]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-6 p-8">
              {/* Logo and Company Name */}
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4">
                  <img
                    src="/logo.png"
                    alt="Galanter & Jones Logo"
                    className="h-20 w-auto"
                  />
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-primary mb-1">Galanter & Jones</h1>
                  <p className="text-muted-foreground text-sm font-medium">Inc.</p>
                </div>
              </div>

              {/* Loading Spinner */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-medium">Loading payslip...</p>
                  <p className="text-muted-foreground text-sm mt-1">Please wait while we prepare your document</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const totalStatutoryDeductions = payslipData.Statutory_Deductions.reduce((acc, item) => acc + parseFloat(item.amount), 0);
  const totalOtherDeductions = payslipData.Other_Deductions.reduce((acc, item) => acc + parseFloat(item.amount), 0);
  const totalDeductions = totalStatutoryDeductions + totalOtherDeductions;
  const totalPayAfterDeductions = parseFloat(payslipData.Basic_Pay - totalDeductions);

  const honorarium = parseFloat(payslipData.Honorarium || 0); // Default to 0 if honorarium is not provided
  const allowance = parseFloat(payslipData.Allowance || 0); // Default to 0 if allowance is not provided
  const netPay = totalPayAfterDeductions + honorarium + allowance;

  const handlePrint = () => {
    // Hide the navbar and footer during printing
    const navbar = document.querySelector('.site-navbar');
    const footer = document.querySelector('.site-footer');
    const nonPrintElements = document.querySelectorAll('.non-print');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (nonPrintElements) {
      nonPrintElements.forEach(el => el.style.display = 'none');
    }
    window.print();

    // Restore the navbar and footer after printing
    setTimeout(() => {
      if (navbar) navbar.style.display = '';
      if (footer) footer.style.display = '';
      if (nonPrintElements) {
        nonPrintElements.forEach(el => el.style.display = '')
      };
    }, 1000);
  }

  // Signature functions
  const openSignatureModal = () => {
    setShowSignatureModal(true);
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    // Don't clear the signature when canceling
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Also clear the stored signature and date when clearing the canvas
    setSignature(null);
    setSignatureDate(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Check if canvas has any content by getting image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some(pixel => pixel !== 0);

    if (hasContent) {
      // Store the signature data before closing the modal
      const signatureDataUrl = canvas.toDataURL();
      setPendingSignature(signatureDataUrl);
      // Show confirmation modal instead of directly saving
      setShowConfirmModal(true);
      setShowSignatureModal(false);
    } else {
      // If no content, just close the modal
      setShowSignatureModal(false);
    }
  };

  const confirmSaveSignature = async () => {
    if (pendingSignature) {
      setIsSaving(true);
      try {
        // Update the local state
        setSignature(pendingSignature);
        const currentDate = new Date().toLocaleDateString();
        setSignatureDate(currentDate);

        // Save to Firebase
        const payslipRef = doc(firestore, "Payslip", payslipId);
        await updateDoc(payslipRef, {
          signature: pendingSignature,
          signatureDate: currentDate,
          lastUpdated: new Date()
        });

        console.log('Signature saved to Firebase successfully');
        setPendingSignature(null); // Clear the pending signature

        // Show success toast
        toast.success("Signature saved successfully!");
      } catch (error) {
        console.error('Error saving signature to Firebase:', error);
        toast.error("Error saving signature");
      } finally {
        setIsSaving(false);
      }
    }
    setShowConfirmModal(false);
  };

  const cancelSaveSignature = () => {
    setShowConfirmModal(false);
    setPendingSignature(null); // Clear the pending signature when canceling
  };

  return (
    <>
      <Navbar className="site-navbar" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Payslip Details</h1>
              <p className="text-muted-foreground">Employee: {payslipData?.Employee_Name} - {payslipData?.Payment_Period}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/payslipUI')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <Button onClick={handlePrint} className="bg-[#263145] hover:bg-[#1a2332] text-white">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Payslip Document */}
          <Card className="print-area max-w-xl mx-auto border border-border font-sans text-sm">
            <CardContent className="p-0">
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
                    <td className="border px-2 py-1 text-right">{allowance ? allowance.toFixed(2) : ""}</td>
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
                  <div className="flex justify-between items-start">
                    <div>
                      <p> Reviewed By:</p>
                      <p className="font-semibold">ACCOUNTANT</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!signature && (
                        <Button
                          type="button"
                          onClick={openSignatureModal}
                          className="non-print"
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          Add Signature
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p> Approved By: </p>
                    </div>
                    {signature && (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={signature}
                          alt="Signature"
                          className="h-20 w-40 object-contain bg-white"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex px-3 border-t-1 justify-between items-center">
                    <p className="font-semibold">BUSINESS MANAGER</p>
                    <p className="font-semibold">Signature Over Printed Name</p>
                  </div>
                </div>
              </div>

              <div className="text-right pr-23 pt-3 text-sm">
                <p><span className="font-semibold">Date: </span><span className="min-w-[80px] inline-block">{signatureDate || '\u00A0'}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer className="site-footer" />

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <Card className="w-[90%] max-w-[500px] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Draw Your Signature
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSignatureModal}
                  className="h-8 w-8"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={200}
                  className="border border-input rounded cursor-crosshair bg-background w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousedown', {
                      clientX: touch.clientX,
                      clientY: touch.clientY
                    });
                    canvasRef.current.dispatchEvent(mouseEvent);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousemove', {
                      clientX: touch.clientX,
                      clientY: touch.clientY
                    });
                    canvasRef.current.dispatchEvent(mouseEvent);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    const mouseEvent = new MouseEvent('mouseup', {});
                    canvasRef.current.dispatchEvent(mouseEvent);
                  }}
                  style={{ touchAction: 'none' }}
                />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={clearSignature}
                >
                  Clear
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={closeSignatureModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveSignature}
                  >
                    Save Signature
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <Card className="w-[90%] max-w-[400px] shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Confirm Signature</h3>
                <p className="text-muted-foreground">Are you sure you want to save this signature?</p>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={cancelSaveSignature}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSaveSignature}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Signature'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default PayrollSlip;

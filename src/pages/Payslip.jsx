import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Adjust the import path as necessary
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
  const [showToast, setShowToast] = useState(false);
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
        }

      } catch (error) {
        console.error("Error fetching payslip data:", error);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-8 p-8">
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
                <h1 className="text-3xl font-bold text-[#022073] mb-1">Galanter & Jones</h1>
                <p className="text-gray-500 text-sm font-medium">Inc.</p>
              </div>
            </div>

            {/* Loading Spinner */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-[#022073]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#022073] animate-ping opacity-20"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-medium">Loading payslip...</p>
                <p className="text-gray-400 text-sm mt-1">Please wait while we prepare your document</p>
              </div>
            </div>
          </div>
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
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
      } catch (error) {
        console.error('Error saving signature to Firebase:', error);
        // You could add an error toast notification here
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
                  <button
                    type="button"
                    onClick={openSignatureModal}
                    className="px-4 py-2 bg-[#022073] text-white text-sm rounded hover:bg-blue-800 transition-colors"
                  >
                    Add Signature
                  </button>
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
      </div>

      {/*Buttons Section*/}
      <div className="flex justify-between max-w-xl mx-auto mt-4 mb-4 non-print">
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
      <Footer className="site-footer" />

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white rounded-lg w-[90%] max-w-[500px] shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Draw Your Signature</h3>
              <button
                onClick={closeSignatureModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <canvas
                ref={canvasRef}
                width={450}
                height={200}
                className="border border-gray-300 rounded cursor-crosshair bg-white"
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
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeSignatureModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  className="px-4 py-2 bg-[#022073] text-white rounded hover:bg-blue-800 transition-colors"
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white rounded-lg w-[90%] max-w-[400px] shadow-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Signature</h3>
              <p className="text-gray-600">Are you sure you want to save this signature?</p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={cancelSaveSignature}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveSignature}
                disabled={isSaving}
                className={`px-6 py-2 rounded transition-colors ${isSaving
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#022073] text-white hover:bg-blue-800'
                  }`}
              >
                {isSaving ? 'Saving...' : 'Save Signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[2000] flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Signature saved successfully!</span>
        </div>
      )}
    </>
  );
};

export default PayrollSlip;

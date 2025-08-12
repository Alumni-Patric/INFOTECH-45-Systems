/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
// import '../payment-voucher-css/App.css'; // Remove this line if using only Tailwind
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase.js";
import { useNavigate } from 'react-router-dom';
import Navbar from '../NewNavbar&Footer/navbar';
import Footer from '../NewNavbar&Footer/footer';

function PaymentVoucher() {
  const [collectionName] = useState("Payment Voucher");
  const navigate = useNavigate();

  const formattedPVNo = () => {
    const dynamicNumber = () => {
      return Math.floor(Math.random() * 1e4)
        .toString()
        .padStart(4, "0");
    }
    return dynamicNumber() + '-' + dynamicNumber() + '-' + dynamicNumber();
  };
  
  const [attributes, setAttributes] = useState([]);
  const [payee, setPayee] = useState([]);
  const [totalAmnt, setTotalAmount] = useState([]);
  const [selectedRFP, setSelectedRFP] = useState('');
  const [selectedPayee, setSelectedPayee] = useState('');
  const [selectedTotalAmnt, setSelectedTotalAmnt] = useState('');

  const fetchRFP = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "Request for Payment"));
      const dataList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      const rfpvalues = dataList.map(dataList => dataList.RFP_NO);
      const payeeName = dataList.map(dataList => dataList.PAYEE);
      const totalamnt = dataList.map(dataList => dataList.TOTALAMT);

      setAttributes(rfpvalues);
      setPayee(payeeName);
      setTotalAmount(totalamnt);
    } catch (error) {
      console.log(error);
    }
  };

  const [checkNumbers, setCheckNumbers] = useState([]);
  const [checkAmounts, setCheckAmounts] = useState([]);
  const [accountName, setAccountName] = useState([]);

  const fetchCheckNoAmount = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "Request for Payment"));
      const dataList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      const checkNos = [];
      const checkAmts = [];
      const accountNm = [];

      dataList.forEach((data) => {
        if (Array.isArray(data.CHARGETO_ROWS)) {
          data.CHARGETO_ROWS.forEach((row) => {
            if (row.checkAmount && row.checkNumber && row.accountName) {
              checkAmts.push(row.checkAmount);
              checkNos.push(row.checkNumber);
              accountNm.push(row.accountName);
            }
          });
        }
      });

      setCheckNumbers(checkNos);
      setCheckAmounts(checkAmts);
      setAccountName(accountNm);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectedRFP = (e) => {
    const selectedValue = e.target.value;
    setSelectedRFP(selectedValue);

    const index = attributes.findIndex((rfp) => rfp === selectedValue);

    if (index !== -1) {
      setSelectedPayee(payee[index]);
      setSelectedTotalAmnt(totalAmnt[index]);
      setValues((prev) => ({
        ...prev,
        RFP_NO: selectedValue,
        Name: payee[index],
        Amount: totalAmnt[index]
      }));
    } else {
      setSelectedPayee('');
      setSelectedTotalAmnt('');
      setValues((prev) => ({
        ...prev,
        RFP_NO: '',
        Name: '',
        Amount: ''
      }));
    }
  };

  //Automatically assign PV_NO when the component mounts
  useEffect(() => {
    const initialPV_NO = formattedPVNo();
    setValues((prev) => ({ ...prev, PV_NO: initialPV_NO }));
  }, []);

  //Automatically set today's date for Date_Recorded when the component mounts
  useEffect(() => {
  setValues2(prev => prev.map(account => ({
    ...account,
    Date_Recorded: new Date().toISOString().split("T")[0] // today's date
  })));
}, []);


  const [values, setValues] = useState({
    Name: "",
    PV_NO: "",
    Amount: "",
    RFP_NO: "",
    Purpose: "",
    Paid_By: "",
    Date_Paid: "",
    PV_Status: "Forwarded",
    Recorded_By: "Barry Simmons",
    Date_Recorded: new Date().toISOString().split("T")[0] // today's date
  });

  const [values2, setValues2] = useState([
    {
      Account_ID: "",
      Account_Name: "",
      Debit_Amount: "",
      Credit_Amount: "",
      Check_No: "",
      Check_Amount: "",
    }
  ]);

  const handleChanges = (e) => {
    const {name, value} = e.target;

    if(name === "Date_Paid") {
    const today = new Date().toISOString().split("T")[0];
      if (value < today) {
        return;
      }
    }
    
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleChanges2 = (e, index) => {
    const { name, value } = e.target;

    setValues2((prev) => {
      const updated = [...prev];

      if(name === "Debit_Amount" || name === "Credit_Amount") {
        //Allow only numbers and 2 decimal point
        const regex = /^[0-9]*\.?[0-9]{0,2}$/;

        if((value.match(/\./g) || []).length > 1) {
          return prev; // Ignore if more than one decimal point
        }

        if (!regex.test(value)) {
          return prev; // Ignore invalid input
        }
      }

      if (name === "Check_No") {
        const checkindex = checkNumbers.findIndex((checkNo) => checkNo === value);
        updated[index][name] = value;
        updated[index].Check_Amount = checkindex !== -1 ? checkAmounts[checkindex] : "";
        updated[index].Account_Name = checkindex !== -1 ? accountName[checkindex] : "";
      }  else {
        updated[index][name] = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentCollectionRef = collection(firestore, collectionName);
    const snapshot = await getDocs(paymentCollectionRef);
    const existingIds = snapshot.docs.map((doc) => parseInt(doc.id.split('-')[1], 10)).filter((id) => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const paymentDocId = `Payment Voucher-${nextId}`;
    // const accountingDocId = `Accounting-${nextId}`;
    const generatedPVNo = formattedPVNo();

    //Prepare the full document to save
    const updatedValues = {
      ...values,
      PV_NO: generatedPVNo,
      Accounts: values2.map(account => ({
        ...account,
        Debit_Amount: account.Debit_Amount === '' ? 0 : parseFloat(account.Debit_Amount),
        Credit_Amount: account.Credit_Amount === '' ? 0 : parseFloat(account.Credit_Amount),
       })),
      };

    try {
      //Save everything in one document
      await setDoc(doc(firestore, collectionName, paymentDocId), updatedValues);
      console.log("Payment Voucher saved successfully!");
    } catch (e) {
      console.log(e);
    }

    try {
      const { PV_NO, Name, Amount, Date_Paid } = updatedValues;
      const docRef = doc(firestore, "Payments Logbook", `Cash_Check_Logs ${nextId}`);

      await setDoc(docRef, {
        PV_NO: PV_NO,
        Payee: Name,
        Amount: Amount,
        Mode: "Check",
        Date: Date_Paid,
        Status: "Pending"
      });

      console.log("Payment Log saved successfully!");
      alert("Payment Logs saved successfully");
    } catch (error) {
      console.error("Error saving Payment Logs: ", error);
    }

    resetForm(generatedPVNo);
  };

  const resetForm = (generatedPVNo) => {
    setValues({
      Name: "",
      PV_NO: generatedPVNo,
      Amount: "",
      RFP_NO: "",
      Purpose: "",
      Paid_By: "",
      Date_Paid: "",
      PV_Status: "Forwarded",
      Recorded_By: "Barry Simmons",
      Date_Recorded: new Date().toISOString().split("T")[0] // today's date
    });

    setValues2([
      {
        Account_ID: "",
        Account_Name: "",
        Debit_Amount: "",
        Credit_Amount: "",
        Check_No: "",
        Check_Amount: "",
      }
    ]);

    setSelectedRFP("");
    setSelectedPayee("");
    setSelectedTotalAmnt("");
  };

  const generateTableForPrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Voucher</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .company-info {
              display: flex;
              align-items: center;
            }
            .chair-icon {
              width: 60px;
              height: 60px;
              border: 2px solid #000;
              margin-right: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
            }
            .company-text {
              font-weight: bold;
              font-size: 14px;
            }
            .voucher-title {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
            }
            .voucher-numbers {
              text-align: right;
              font-weight: bold;
            }
            .form-section {
              margin-bottom: 20px;
            }
            .form-row {
              display: flex;
              margin-bottom: 10px;
              align-items: center;
            }
            .form-label {
              font-weight: bold;
              margin-right: 10px;
              min-width: 100px;
            }
            .form-input {
              border-bottom: 1px solid #000;
              flex: 1;
              padding: 2px 5px;
              margin-right: 20px;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
            }
            .signature-box {
              text-align: center;
              min-width: 200px;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
              height: 40px;
            }
            .check-section {
              display: flex;
              gap: 20px;
              margin: 20px 0;
            }
            .accounting-header {
              background-color: #f0f0f0;
              text-align: center;
              font-weight: bold;
              padding: 10px;
              border: 1px solid #000;
              margin: 20px 0 10px 0;
            }
            .accounting-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .accounting-table th,
            .accounting-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            .accounting-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .bottom-signature {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
            }
            .bottom-signature-box {
              text-align: center;
              min-width: 200px;
            }
            .bottom-signature-line {
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
              height: 40px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <div class="chair-icon">
                🪑
              </div>
              <div class="company-text">
                Galanter & Jones SLA. Inc.<br>
                <span style="font-size: 10px; font-style: italic;">Heated Outdoor Furniture</span>
              </div>
            </div>
            <div class="voucher-title">Payment Voucher</div>
            <div class="voucher-numbers">
              PV No: <span style="border-bottom: 1px solid #000; padding: 2px 10px;">${values.PV_NO || '_____________'}</span><br><br>
              RFP No: <span style="border-bottom: 1px solid #000; padding: 2px 10px;">${values.RFP_NO || '_____________'}</span>
            </div>
          </div>

          <div class="form-section">
            <div class="form-row">
              <span class="form-label">Payee:</span>
              <span class="form-input">${values.Name || '_'.repeat(50)}</span>
            </div>
            
            <div class="form-row" style="margin-top: 20px;">
              <span class="form-label">Total Amount:</span>
              <span class="form-input">₱${values.Amount ? Number(values.Amount).toLocaleString() : '_'.repeat(20)}</span>
            </div>
            
            <div class="form-row" style="margin-top: 20px;">
              <span class="form-label">Purpose:</span>
              <span class="form-input">${values.Purpose || '_'.repeat(60)}</span>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div style="font-weight: bold; margin-bottom: 10px;">Paid by:</div>
              <div style="font-weight: bold; margin-bottom: 5px;">Treasurer</div>
              <div class="signature-line"></div>
              <div style="font-size: 10px; font-style: italic;">(Signature over printed name)</div>
            </div>
            <div class="signature-box">
              <div style="font-weight: bold; margin-bottom: 40px;">Date Paid:</div>
              <div style="border-bottom: 1px solid #000; padding: 2px 10px; margin-bottom: 20px;">
                ${values.Date_Paid || '_____________'}
              </div>
            </div>
          </div>

          <div class="check-section">
            <div>
              <span style="font-weight: bold;">Check #:</span>
              <span style="border-bottom: 1px solid #000; padding: 2px 15px; margin-left: 10px;">
                ${values2[0]?.Check_No || '_'.repeat(15)}
              </span>
            </div>
            <div>
              <span style="font-weight: bold;">Check Amount:</span>
              <span style="border-bottom: 1px solid #000; padding: 2px 15px; margin-left: 10px;">
                ₱${values2[0]?.Check_Amount ? Number(values2[0].Check_Amount).toLocaleString() : '_'.repeat(15)}
              </span>
            </div>
          </div>

          <div class="accounting-header">
            TO BE FILLED UP BY BOOKKEEPER/ACCOUNTING PERSONNEL
          </div>

          <table class="accounting-table">
            <thead>
              <tr>
                <th>Account No</th>
                <th>Account Name:</th>
                <th>Debit - Amount</th>
                <th>Credit - Amount</th>
              </tr>
            </thead>
            <tbody>
              ${values2.map(account => `
                <tr>
                  <td>${account.Account_ID || '_'.repeat(8)}</td>
                  <td>${account.Account_Name || '_'.repeat(20)}</td>
                  <td>₱${account.Debit_Amount ? Number(account.Debit_Amount).toLocaleString() : '_'.repeat(10)}</td>
                  <td>₱${account.Credit_Amount ? Number(account.Credit_Amount).toLocaleString() : '_'.repeat(10)}</td>
                </tr>
              `).join("")}
              ${Array(3 - values2.length).fill().map(() => `
                <tr>
                  <td>${'_'.repeat(8)}</td>
                  <td>${'_'.repeat(20)}</td>
                  <td>${'_'.repeat(10)}</td>
                  <td>${'_'.repeat(10)}</td>
                </tr>
              `).join("")}
              <tr style="border-top: 2px solid #000;">
                <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
                <td style="border-bottom: 2px solid #000;">${'_'.repeat(10)}</td>
                <td style="border-bottom: 2px solid #000;">${'_'.repeat(10)}</td>
              </tr>
            </tbody>
          </table>

          <div class="bottom-signature">
            <div class="bottom-signature-box">
              <div style="font-weight: bold; margin-bottom: 10px;">Recorded by:</div>
              <div style="font-weight: bold; margin-bottom: 5px;">Bookkeeper/Accounting</div>
              <div class="bottom-signature-line"></div>
              <div style="font-size: 10px; font-style: italic;">(Signature over printed name)</div>
            </div>
            <div class="bottom-signature-box">
              <div style="font-weight: bold; margin-bottom: 40px;">Date Recorded:</div>
              <div style="border-bottom: 1px solid #000; padding: 2px 10px; margin-bottom: 20px;">
                ${values2[0]?.Date_Recorded || '_____________'}
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [count, setCount] = useState(2);

  const addElement = () => {
    setValues2((prev) => {
      const newAccount = {
        Account_ID: "",
        Account_Name: "",
        Debit_Amount: "",
        Credit_Amount: "",
        Check_No: "",
        Check_Amount: "",
      };
      return [...prev, newAccount];
    });
    setCount(count + 1);
  };

  const removeElement = () => {
    if (values2.length > 1) {
      setValues2(values2.slice(0, -1));
      setCount(count - 1);
    }
  };

  useEffect(() => {
    fetchRFP();
    fetchCheckNoAmount();
  }, []);

  const handlePrint = () => {
    window.print();
  }

  return (
    <>
      <Navbar />
      <div className="print-area max-w-4xl mx-auto bg-white shadow-lg border-none mt-16 p-10 rounded-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Payment Voucher</h2>

          {/* PV No and RFP No (two columns) */}
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <label htmlFor="pvno" className="w-24 font-semibold text-gray-700">PV No:</label>
            <input type="text" name="PV_NO" className="flex-1 px-3 py-2 border rounded bg-gray-100" value={values.PV_NO}
              onChange={handleChanges} required disabled />
            <label htmlFor="rfpno" className="w-24 font-semibold text-gray-700">RFP No:</label>
            <select type="text" name="RFP_NO" id="rfpno" className="flex-1 px-3 py-2 border rounded" value={selectedRFP} onChange={handleSelectedRFP}>
              <option value="">Select RFP</option>
              {attributes.map((rfp, index) => (
                <option key={index} value={rfp}> {rfp} </option>
              ))}
            </select>
          </div>

          {/* Payee (single column, aligned) */}
          <div className="flex items-center gap-6 mb-4">
            <label htmlFor="name" className="w-24 font-semibold text-gray-700">Payee:</label>
            <input type="text" name="Name"
              onChange={handleChanges} value={selectedPayee} required disabled
              className="flex-1 px-3 py-2 border rounded bg-gray-100" />
          </div>

          {/* Total Amount (single column, aligned) */}
          <div className="flex items-center gap-6 mb-4">
            <label htmlFor="amount" className="w-24 font-semibold text-gray-700">Total Amount:</label>
            <input type="text" name="Amount" className="flex-1 px-3 py-2 border rounded bg-gray-100"
              onChange={handleChanges} value={selectedTotalAmnt} required disabled />
          </div>

          {/* Date Paid (single column, aligned with above) */}
          <div className="flex items-center gap-6 mb-4">
            <label htmlFor="date" className="w-24 font-semibold text-gray-700">Date Paid:</label>
            <input type="date" name="Date_Paid" className="flex-1 px-3 py-2 border rounded"
              onChange={handleChanges} min={new Date().toISOString().split("T")[0]} value={values.Date_Paid} required />
          </div>

          {/* Purpose (single column, aligned) */}
          <div className="flex items-center gap-6 mb-4">
            <label htmlFor="purpose" className="w-24 font-semibold text-gray-700">Purpose:</label>
            <select name="Purpose" id="purpose" className="flex-1 px-3 py-2 border rounded" onChange={handleChanges} value={values.Purpose} required>
              <option value="">Select Purpose</option>
              <option value="Purchase Goods">Purchase Goods</option>
              <option value="Service Payment">Service Payment</option>
              <option value="Rent Payment">Rent Payment</option>
              <option value="Utility Bills">Utility Bills</option>
              <option value="Employee Reimbursement">Employee Reimbursement</option>
            </select>
          </div>

          {/* Paid By (single column, aligned) */}
          <div className="flex items-center gap-6 mb-4">
            <label htmlFor="paid" className="w-24 font-semibold text-gray-700">Paid By: <span className="italic text-gray-400">*</span></label>
            <input type="text" name="Paid_By" className="flex-1 px-3 py-2 border rounded"
              onChange={handleChanges} value={values.Paid_By} required />
          </div>

          <hr className="my-6" />

          <h2 className="text-xl font-bold mb-4 text-gray-700">Bookkeeping/Accounting</h2>

          {values2.map((account, index) => (
            <div key={index} className="bg-gray-100 border-2 border-gray-300 p-6 rounded mb-4">
              <div className="mb-2 font-semibold text-gray-700">Account {index + 1}</div>
              <div className="flex flex-wrap items-center gap-6 mb-2">
                <label htmlFor={`account-${index}`} className="w-32 font-semibold text-gray-700">Account No:</label>
                <input
                  type="number"
                  name="Account_ID"
                  className="flex-1 px-3 py-2 border rounded no-spinner"
                  value={account.Account_ID}
                  onChange={(e) => handleChanges2(e, index)}
                  required
                />
                <label htmlFor={`debit-${index}`} className="w-32 font-semibold text-gray-700">Debit Amount:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="Debit_Amount"
                  className="flex-1 px-3 py-2 border rounded no-spinner"
                  value={account.Debit_Amount ?? ""}
                  onKeyDown={(e) => {
                    const value = e.target.value || "";
                    
                    // Allow only numbers and decimal point
                    if(
                      (e.key === 'Backspace' || 
                        e.key === 'Delete' || 
                        e.key === 'Tab' ||
                        e.key.startsWith('Arrow'))
                    ){
                      return; //Dont block these keys
                    }
                    
                    //Only allow one decimal point
                    if(e.key === '.' && value.includes('.')) {
                      e.preventDefault();
                      return;
                    }

                    //Block anything that is not a number or decimal point
                    if(!/[0-9.]/.test(e.key)) {
                      e.preventDefault(); 
                    }
                  }}
                  onChange={(e) => handleChanges2(e, index)}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-wrap items-center gap-6 mb-2">
                <label htmlFor={`accountname-${index}`} className="w-32 font-semibold text-gray-700">Account Name:</label>
                <input
                  type="text"
                  name="Account_Name"
                  className="flex-1 px-3 py-2 border rounded"
                  value={account.Account_Name}
                  onChange={(e) => handleChanges2(e, index)}
                  required
                />
                <label htmlFor={`credit-${index}`} className="w-32 font-semibold text-gray-700">Credit Amount:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="Credit_Amount"
                  className="flex-1 px-3 py-2 border rounded no-spinner"
                  value={account.Credit_Amount ?? ""}
                  onKeyDown={(e) => {
                    const value = e.target.value || "";

                    // Allow only numbers and decimal point
                    if(
                      (e.key === 'Backspace' || 
                        e.key === 'Delete' || 
                        e.key === 'Tab' ||
                        e.key.startsWith('Arrow'))
                    ){
                      return; //Dont block these keys
                    }
                    
                    //Only allow one decimal point
                    if(e.key === '.' && value.includes('.')) {
                      e.preventDefault();
                      return;
                    }

                    //Block anything that is not a number or decimal point
                    if(!/[0-9.]/.test(e.key)) {
                      e.preventDefault(); 
                    }
                  }}
                  onChange={(e) => handleChanges2(e, index)}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <label htmlFor={`checkno-${index}`} className="w-32 font-semibold text-gray-700">Check No:</label>
                <select
                  name="Check_No"
                  id={`checkno-${index}`}
                  className="flex-1 px-3 py-2 border rounded"
                  value={account.Check_No}
                  onChange={(e) => handleChanges2(e, index)}
                >
                  <option value="">Select Check</option>
                  {checkNumbers.map((checkNo, idx) => (
                    <option key={idx} value={checkNo}>{checkNo}</option>
                  ))}
                </select>
                <label htmlFor={`checkamt-${index}`} className="w-32 font-semibold text-gray-700">Check Amount:</label>
                <input
                  type="text"
                  name="Check_Amount"
                  className="flex-1 px-3 py-2 border rounded bg-gray-100"
                  value={account.Check_Amount || 0}
                  onChange={(e) => handleChanges2(e, index)}
                  disabled
                />
              </div>
            </div>
          ))}

          <div className="flex gap-4 mb-4">
            <button type="button" className="px-6 py-2 rounded bg-green-200 hover:bg-green-300 font-semibold" onClick={addElement}>Add Account</button>
            <button type="button" className="px-6 py-2 rounded bg-red-200 hover:bg-red-300 font-semibold" onClick={removeElement} disabled={values2.length <= 1}>Remove Account</button>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-4">
            <label htmlFor="recorded" className="w-32 font-semibold text-gray-700">Recorded By:</label>
            <select name="Recorded_By" id="recorded" className="flex-1 px-3 py-2 border rounded" value={values2[0].Recorded_By} onChange={handleChanges2}>
              <option value="Barry Simmons">Barry Simmons</option>
              <option value="Larry Smith">Larry Smith</option>
              <option value="Lucy Parrot">Lucy Parrot</option>
            </select>
            <label htmlFor="daterec" className="w-32 font-semibold text-gray-700">Date Recorded:</label>
            <input type="date" name="Date_Recorded" className="flex-1 px-3 py-2 border rounded"
              value={values2[0]?.Date_Recorded} required readOnly />
          </div>

          <hr className="my-6" />

          <div className="flex gap-4 justify-end">
            <button type="button" className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 font-semibold" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 font-semibold">Save</button>

            {/*Printing should be done after creation, when viewing the payment voucher itself */}
            {/* <button type="button" className="px-6 py-2 rounded bg-yellow-400 text-white hover:bg-yellow-500 font-semibold" onClick={handlePrint}>Print</button> */}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default PaymentVoucher;
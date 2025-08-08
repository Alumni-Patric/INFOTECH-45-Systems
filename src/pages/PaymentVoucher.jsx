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

  const formattedSINo = () => {
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

  useEffect(() => {
    const initialPV_NO = formattedPVNo();
    setValues((prev) => ({ ...prev, PV_NO: initialPV_NO }));
  }, []);

  useEffect(() => {
    const initialSI_No = formattedSINo();
    setValues((prev) => ({ ...prev, SI_NO: initialSI_No }));
  }, []);

  const [values, setValues] = useState({
    Name: "",
    PV_NO: "",
    Amount: "",
    RFP_NO: "",
    Purpose: "",
    Paid_By: "",
    Date_Paid: "",
    Received_By: "",
    SI_NO: "",
    PV_Status: "Forwarded"
  });

  const [values2, setValues2] = useState([
    {
      Account_ID: "",
      Account_Name: "",
      Debit_Amount: "",
      Credit_Amount: "",
      Check_No: "",
      Check_Amount: "",
      Recorded_By: "Barry Simmons",
      Date_Recorded: ""
    }
  ]);

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChanges2 = (e, index) => {
    const { name, value } = e.target;

    setValues2((prev) => {
      const updated = [...prev];
      if (name === "Check_No") {
        const checkindex = checkNumbers.findIndex((checkNo) => checkNo === value);
        updated[index][name] = value;
        updated[index].Check_Amount = checkindex !== -1 ? checkAmounts[checkindex] : "";
        updated[index].Account_Name = checkindex !== -1 ? accountName[checkindex] : "";
      } else if (name === "Recorded_By" || name === "Date_Recorded") {
        updated.forEach((account) => {
          account[name] = value;
        });
      } else {
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
    const paymentDocId = `Payment-${nextId}`;
    const accountingDocId = `Accounting-${nextId}`;
    const generatedPVNo = formattedPVNo();
    const generatedSINo = formattedSINo();

    const updatedValues = {
      ...values,
      PV_NO: generatedPVNo,
      SI_NO: generatedSINo
    };

    try {
      await setDoc(doc(firestore, collectionName, paymentDocId), updatedValues);
      console.log("Payment Voucher saved successfully!");
    } catch (e) {
      console.log(e);
    }

    try {
      const accountsToSave = values2.map((account) => ({
        ...account,
        Recorded_By: values2[0]?.Recorded_By || "",
        Date_Recorded: values2[0]?.Date_Recorded || "",
        Debit_Amount: account.Debit_Amount === '' ? 0 : parseFloat(account.Debit_Amount),
        Credit_Amount: account.Credit_Amount === '' ? 0 : parseFloat(account.Credit_Amount),
      }));

      await setDoc(doc(firestore, collectionName, accountingDocId), {
        Accounts: accountsToSave
      });
      console.log("Accounting records saved successfully!");
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

    resetForm(generatedPVNo, generatedSINo);
  };

  const resetForm = (generatedPVNo, generatedSINo) => {
    setValues({
      Name: "",
      PV_NO: generatedPVNo,
      Amount: "",
      RFP_NO: "",
      Purpose: "",
      Paid_By: "",
      Date_Paid: "",
      Received_By: "",
      SI_NO: generatedSINo,
      PV_Status: "Forwarded"
    });

    setValues2([
      {
        Account_ID: "",
        Account_Name: "",
        Debit_Amount: "",
        Credit_Amount: "",
        Check_No: "",
        Check_Amount: "",
        Recorded_By: "Barry Simmons",
        Date_Recorded: ""
      }
    ]);

    setSelectedRFP("");
    setSelectedPayee("");
    setSelectedTotalAmnt("");
  };

  const generateTableForPrint = () => {
    const paymentTable = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px;">PV_NO</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
            <th style="border: 1px solid #ddd; padding: 8px;">RFP_NO</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Purpose</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Paid_By</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Date_Paid</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Received_By</th>
            <th style="border: 1px solid #ddd; padding: 8px;">SI_NO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.Name || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.PV_NO || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.Amount || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.RFP_NO || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.Purpose || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.Paid_By || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.Date_Paid || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.Received_By || ''}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${values.SI_NO || ''}</td>
            </tr>
        </tbody>
      </table>`;

    const accountingTable = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">Account No</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Account Name</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Debit</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Credit</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Check No</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Check Amount</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Recorded By</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Date Recorded</th>
          </tr>
        </thead>
        <tbody>
          ${values2.map(account => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Account_ID}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Account_Name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Debit_Amount}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Credit_Amount}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Check_No}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Check_Amount}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Recorded_By}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${account.Date_Recorded}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;

    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Voucher</title>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              font-family: Arial, sans-serif;
            }
            th, td {
              border: 1px solid #ddd;
              text-align: left;
              padding: 8px;
            }
            th {
              background-color: #f4f4f4;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <h1>Payment Voucher Details</h1>
          ${paymentTable}
          <h1>Accounting Details</h1>
          ${accountingTable}
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
        Recorded_By: prev[0]?.Recorded_By || "",
        Date_Recorded: prev[0]?.Date_Recorded || "",
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
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white shadow-lg border-none mt-16 p-10 rounded-lg">
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
      onChange={handleChanges} required />
  </div>

  {/* Purpose (single column, aligned) */}
  <div className="flex items-center gap-6 mb-4">
    <label htmlFor="purpose" className="w-24 font-semibold text-gray-700">Purpose:</label>
    <select name="Purpose" id="purpose" className="flex-1 px-3 py-2 border rounded" onChange={handleChanges}>
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
                  type="text"
                  name="Account_ID"
                  className="flex-1 px-3 py-2 border rounded"
                  value={account.Account_ID}
                  onChange={(e) => handleChanges2(e, index)}
                  required
                />
                <label htmlFor={`debit-${index}`} className="w-32 font-semibold text-gray-700">Debit Amount:</label>
                <input
                  type="text"
                  name="Debit_Amount"
                  className="flex-1 px-3 py-2 border rounded"
                  value={account.Debit_Amount ?? ""}
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
                  type="text"
                  name="Credit_Amount"
                  className="flex-1 px-3 py-2 border rounded"
                  value={account.Credit_Amount ?? ""}
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
              onChange={handleChanges2} required />
          </div>

          <hr className="my-6" />

          <div className="flex gap-4 justify-end">
            <button type="button" className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 font-semibold" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 font-semibold">Save</button>
            <button type="button" className="px-6 py-2 rounded bg-yellow-400 text-white hover:bg-yellow-500 font-semibold" onClick={generateTableForPrint}>Print</button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default PaymentVoucher;
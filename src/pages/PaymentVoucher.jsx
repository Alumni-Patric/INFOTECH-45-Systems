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
  const [selectedCheckNo, setSelectedCheckNo] = useState('');
  const [selectedCheckAmt, setSelectedCheckAmt] = useState('');
  const [selectedAccountName, setSelectedAccountName] = useState('');

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

      console.log("RFP dataList:", dataList);
      
      dataList.forEach((data) => {
        console.log("Processing RFP data:", data);
        if (Array.isArray(data.CHARGETO_ROWS)) {
          console.log("CHARGETO_ROWS found:", data.CHARGETO_ROWS);
          data.CHARGETO_ROWS.forEach((row, index) => {
            console.log(`Row ${index}:`, row);
            if (row.checkAmount && row.checkNumber && row.accountName) {
              checkAmts.push(row.checkAmount);
              checkNos.push(row.checkNumber);
              accountNm.push(row.accountName);
              console.log(`Added: checkAmount=${row.checkAmount}, checkNumber=${row.checkNumber}, accountName=${row.accountName}`);
            } else {
              console.log(`Row ${index} missing data:`, {
                checkAmount: row.checkAmount,
                checkNumber: row.checkNumber,
                accountName: row.accountName
              });
            }
          });
        } else {
          console.log("CHARGETO_ROWS not found or not an array for data:", data);
        }
      });

      console.log("Final arrays:", {
        checkNos,
        checkAmts,
        accountNm
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
      
      // For the main form, we don't set check data since it should be in accounts
      setValues((prev) => ({
        ...prev,
        RFP_NO: selectedValue,
        Name: payee[index],
        Amount: totalAmnt[index],
      }));

      // Populate ALL existing accounts with check data from the selected RFP
      setValues2((prev) => {
        return prev.map((account, accountIndex) => {
          const checkNo = checkNumbers[accountIndex] || '';
          const checkAmount = checkAmounts[accountIndex] || '';
          const accName = accountName[accountIndex] || '';
          
          console.log(`Populating account ${accountIndex + 1} with:`, {
            checkNo,
            checkAmount,
            accName
          });
          
          return {
            ...account,
            Check_No: checkNo,
            Check_Amount: checkAmount,
            Account_Name: accName
          };
        });
      });

      // Set the selected values for the first account (for compatibility)
      if (checkNumbers.length > 0 && checkAmounts.length > 0) {
        setSelectedCheckNo(checkNumbers[0] || '');
        setSelectedCheckAmt(checkAmounts[0] || '');
        setSelectedAccountName(accountName[0] || '');
      }
    } else {
      setSelectedPayee('');
      setSelectedTotalAmnt('');
      setSelectedCheckNo('');
      setSelectedCheckAmt('');
      setSelectedAccountName('');
      setValues((prev) => ({
        ...prev,
        RFP_NO: '',
        Name: '',
        Amount: '',
      }));
      
      // Clear ALL accounts
      setValues2((prev) => {
        return prev.map((account) => ({
          ...account,
          Check_No: '',
          Check_Amount: '',
          Account_Name: ''
        }));
      });
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
        console.log("Check_No selected:", value);
        console.log("Available checkNumbers:", checkNumbers);
        console.log("Available checkAmounts:", checkAmounts);
        console.log("Available accountName:", accountName);
        
        const checkindex = checkNumbers.findIndex((checkNo) => checkNo === value);
        console.log("Found checkindex:", checkindex);
        
        updated[index][name] = value;
        updated[index].Check_Amount = checkindex !== -1 ? checkAmounts[checkindex] : "";
        updated[index].Account_Name = checkindex !== -1 ? accountName[checkindex] : "";
        
        console.log("Updated Check_Amount to:", updated[index].Check_Amount);
        console.log("Updated Account_Name to:", updated[index].Account_Name);
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
    console.log("values2 before processing:", values2);
    
    const updatedValues = {
      // Only include top-level fields, exclude those that should be in Accounts array
      Name: values.Name,
      PV_NO: generatedPVNo,
      Amount: values.Amount,
      RFP_NO: values.RFP_NO,
      Purpose: values.Purpose,
      Paid_By: values.Paid_By,
      Date_Paid: values.Date_Paid,
      PV_Status: values.PV_Status,
      Accounts: values2.map(account => {
        console.log("Processing account:", account);
        console.log("account.Check_Amount:", account.Check_Amount);
        
        const processedAccount = {
          ...account,
          Debit_Amount: account.Debit_Amount === '' ? 0 : parseFloat(account.Debit_Amount),
          Credit_Amount: account.Credit_Amount === '' ? 0 : parseFloat(account.Credit_Amount),
          Check_Amount: account.Check_Amount === '' ? 0 : parseFloat(account.Check_Amount),
          Account_Name: account.Account_Name || selectedAccountName,
          Check_No: account.Check_No || selectedCheckNo,
          Date_Recorded: values.Date_Recorded, // Store in each account
          Recorded_By: values.Recorded_By, // Store in each account
        };
        
        console.log("Processed account:", processedAccount);
        return processedAccount;
      }),
    };

    console.log("Final updatedValues:", updatedValues);

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

    // Clear all selected state variables including account-related fields
    setSelectedRFP("");
    setSelectedPayee("");
    setSelectedTotalAmnt("");
    setSelectedCheckNo("");
    setSelectedCheckAmt("");
    setSelectedAccountName("");
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
                  value={index === 0 ? (selectedAccountName || account.Account_Name) : account.Account_Name}
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
                  value={index === 0 ? (selectedCheckNo || account.Check_No) : account.Check_No}
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
                  value={index === 0 ? (selectedCheckAmt || account.Check_Amount) : account.Check_Amount}
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
            <select name="Recorded_By" id="recorded" className="flex-1 px-3 py-2 border rounded" value={values.Recorded_By} onChange={handleChanges}>
              <option value="Barry Simmons">Barry Simmons</option>
              <option value="Larry Smith">Larry Smith</option>
              <option value="Lucy Parrot">Lucy Parrot</option>
            </select>
            <label htmlFor="daterec" className="w-32 font-semibold text-gray-700">Date Recorded:</label>
            <input type="date" name="Date_Recorded" className="flex-1 px-3 py-2 border rounded"
              value={values.Date_Recorded} required readOnly />
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
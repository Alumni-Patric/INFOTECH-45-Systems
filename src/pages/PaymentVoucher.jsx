/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { firestore } from "../firebase.js";
import { useNavigate } from 'react-router-dom';
import Navbar from '../NewNavbar&Footer/navbar';
import Footer from '../NewNavbar&Footer/footer';
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { ArrowLeft, Save, Plus, Minus, FileText, User, Calendar, DollarSign, Calculator, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

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
    //   //Filter out data by status if "Approved" or "Rejected"
    //  .filter((doc) => {
    //    const status = doc.data().STATUS;
    //    return status === "Approved" || status === "Rejected";
    //  });

      const rfpvalues = dataList.map(dataList => dataList.RFP_NO);
      const payeeName = dataList.map(dataList => dataList.PAYEE);
      const totalamnt = dataList.map(dataList => dataList.TOTALAMT);

      setAttributes(rfpvalues);
      setPayee(payeeName);
      setTotalAmount(totalamnt);
    } catch (error) {
      console.log(error);
      toast.error("Error loading RFP data");
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
      toast.error("Error loading check data");
    }
  };

  // const handleSelectedRFP = (e) => {
  //   const selectedValue = e.target.value;
  //   setSelectedRFP(selectedValue);

  //   const index = attributes.findIndex((rfp) => rfp === selectedValue);

  //   if (index !== -1) {
  //     setSelectedPayee(payee[index]);
  //     setSelectedTotalAmnt(totalAmnt[index]);
      
  //     // For the main form, we don't set check data since it should be in accounts
  //     setValues((prev) => ({
  //       ...prev,
  //       RFP_NO: selectedValue,
  //       Name: payee[index],
  //       Amount: totalAmnt[index],
  //     }));

  //     // Find the selected RFP's CHARGETO_ROWS to determine how many accounts to create
  //     const fetchSelectedRFPAccounts = async () => {
  //       try {
  //         const querySnapshot = await getDocs(collection(firestore, "Request for Payment"));
  //         const dataList = querySnapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data()
  //         }));

  //         const selectedRFPData = dataList.find((data) => data.RFP_NO === selectedValue);

  //         if (selectedRFPData && selectedRFPData.data().CHARGETO_ROWS) {
  //           const chargeToRows = selectedRFPData.data().CHARGETO_ROWS;
  //           console.log("Selected RFP CHARGETO_ROWS:", chargeToRows);
            
  //           // Create accounts array based on the number of CHARGETO_ROWS
  //           const newAccounts = chargeToRows.map((row, accountIndex) => ({
  //             Account_ID: "",
  //             Account_Name: row.accountName || '',
  //             Debit_Amount: "",
  //             Credit_Amount: "",
  //             Check_No: row.checkNumber || '',
  //             Check_Amount: row.checkAmount || '',
  //           }));
            
  //           console.log("Creating accounts:", newAccounts);
  //           setValues2(newAccounts);
            
  //           // Update count to match the number of accounts
  //           setCount(newAccounts.length + 1);
            
  //           // Set selected values for the first account (for compatibility)
  //           if (chargeToRows.length > 0) {
  //             setSelectedCheckNo(chargeToRows[0].checkNumber || '');
  //             setSelectedCheckAmt(chargeToRows[0].checkAmount || '');
  //             setSelectedAccountName(chargeToRows[0].accountName || '');
  //           }
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };

  //     fetchSelectedRFPAccounts();

  //     // // Populate ALL existing accounts with check data from the selected RFP
  //     // setValues2((prev) => {
  //     //   return prev.map((account, accountIndex) => {
  //     //     const checkNo = checkNumbers[accountIndex] || '';
  //     //     const checkAmount = checkAmounts[accountIndex] || '';
  //     //     const accName = accountName[accountIndex] || '';
          
  //     //     console.log(`Populating account ${accountIndex + 1} with:`, {
  //     //       checkNo,
  //     //       checkAmount,
  //     //       accName
  //     //     });
          
  //     //     return {
  //     //       ...account,
  //     //       Check_No: checkNo,
  //     //       Check_Amount: checkAmount,
  //     //       Account_Name: accName
  //     //     };
  //     //   });
  //     // });

  //     // // Set the selected values for the first account (for compatibility)
  //     // if (checkNumbers.length > 0 && checkAmounts.length > 0) {
  //     //   setSelectedCheckNo(checkNumbers[0] || '');
  //     //   setSelectedCheckAmt(checkAmounts[0] || '');
  //     //   setSelectedAccountName(accountName[0] || '');
  //     // }
  //   } else {
  //     setSelectedPayee('');
  //     setSelectedTotalAmnt('');
  //     setSelectedCheckNo('');
  //     setSelectedCheckAmt('');
  //     setSelectedAccountName('');
  //     setValues((prev) => ({
  //       ...prev,
  //       RFP_NO: '',
  //       Name: '',
  //       Amount: '',
  //     }));
      
  //     // // Clear ALL accounts
  //     // setValues2((prev) => {
  //     //   return prev.map((account) => ({
  //     //     ...account,
  //     //     Check_No: '',
  //     //     Check_Amount: '',
  //     //     Account_Name: '',
  //     //     Credit_Amount: '',
  //     //   }));
  //     // });

  //     setValues2([{
  //       Account_ID:"",
  //       Account_Name:"",
  //       Debit_Amount:"",
  //       Credit_Amount:"",
  //       Check_No:"",
  //       Check_Amount:"", 
  //     }]);

  //     setCount(2); // Reset count to 2 since we cleared accounts
  //   }
  // };

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
      Amount: totalAmnt[index],
    }));

    // Find the selected RFP's CHARGETO_ROWS to determine how many accounts to create
    const fetchSelectedRFPAccounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "Request for Payment"));
        const selectedRFPData = querySnapshot.docs.find(doc => doc.data().RFP_NO === selectedValue);
        
        if (selectedRFPData && selectedRFPData.data().CHARGETO_ROWS) {
          const chargeToRows = selectedRFPData.data().CHARGETO_ROWS;
          console.log("Selected RFP CHARGETO_ROWS:", chargeToRows);
          
          // Create accounts array based on the number of CHARGETO_ROWS
          const newAccounts = chargeToRows.map((row, accountIndex) => ({
            Account_ID: "",
            Account_Name: row.accountName || '',
            Debit_Amount: "",
            Credit_Amount: "",
            Check_No: row.checkNumber || '',
            Check_Amount: row.checkAmount || '',
          }));
          
          console.log("Creating accounts:", newAccounts);
          setValues2(newAccounts);
          
          // Update count to match the number of accounts
          setCount(newAccounts.length + 1);
          
          // Set selected values for the first account (for compatibility)
          if (chargeToRows.length > 0) {
            setSelectedCheckNo(chargeToRows[0].checkNumber || '');
            setSelectedCheckAmt(chargeToRows[0].checkAmount || '');
            setSelectedAccountName(chargeToRows[0].accountName || '');
          }
        }
      } catch (error) {
        console.log("Error fetching RFP accounts:", error);
      }
    };

    fetchSelectedRFPAccounts();

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
    
    // Reset to single empty account
    setValues2([{
      Account_ID: "",
      Account_Name: "",
      Debit_Amount: "",
      Credit_Amount: "",
      Check_No: "",
      Check_Amount: "",
    }]);
    setCount(2);
  }
};

  // Create this helper function at the top of your component
  const getCurrentLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      Date_Recorded: getCurrentLocalDate() //Today's Date
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
    Date_Recorded: getCurrentLocalDate() //Today's Date
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
    const { name, value } = e.target;

    if (name === "Date_Paid") {
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

      if (name === "Debit_Amount" || name === "Credit_Amount") {
        //Allow only numbers and 2 decimal point
        const regex = /^[0-9]*\.?[0-9]{0,2}$/;

        if ((value.match(/\./g) || []).length > 1) {
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
      } else {
        updated[index][name] = value;
      }
      return updated;
    });
  };

  //Confirmation message before saving payment voucher
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Store the current form data in state
    setPendingSubmitData(e);
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    if(!pendingSubmitData) return;
    
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
      } catch (error) {
        console.error("Error saving Payment Logs: ", error);
        toast.error("Error saving payment logs");
      }

      // Close confirmation dialog and show success dialog
      setShowConfirmDialog(false);
      setPendingSubmitData(null);
      setShowSuccessDialog(true);

    } catch (e) {
      console.log(e);
      toast.error("Error saving payment voucher");
      
      // Close confirmation dialog on error
      setShowConfirmDialog(false);
      setPendingSubmitData(null);
    }
  };

  const cancelSave = () => {
    setShowConfirmDialog(false);
    setPendingSubmitData(null);
  };

  const handleViewRecords = () => {
    setShowSuccessDialog(false);
    navigate('/payment-voucher-table');
  };

  const handleCreateAnother = () => {
    setShowSuccessDialog(false);
    resetForm(formattedPVNo());
    toast.success("Ready to create a new payment voucher");
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
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
      Date_Recorded: getCurrentLocalDate() //Today's Date
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

 

          {/* <form onSubmit={handleSubmit} className="space-y-6"> */}
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PV No and RFP No */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">PV No</label>
                    <Input
                      type="text"
                      name="PV_NO"
                      value={values.PV_NO}
                      onChange={handleChanges}
                      required
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">RFP No</label>
                    <select
                      name="RFP_NO"
                      value={selectedRFP}
                      onChange={handleSelectedRFP}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select RFP</option>
                      {attributes.map((rfp, index) => (
                        <option key={index} value={rfp}>{rfp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payee and Total Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Payee</label>
                    <Input
                      type="text"
                      name="Name"
                      value={selectedPayee}
                      onChange={handleChanges}
                      required
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Total Amount</label>
                    <Input
                      type="text"
                      name="Amount"
                      value={selectedTotalAmnt}
                      onChange={handleChanges}
                      required
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                {/* Date Paid and Purpose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date Paid</label>
                    <Input
                      type="date"
                      name="Date_Paid"
                      value={values.Date_Paid}
                      onChange={handleChanges}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Purpose</label>
                    <select
                      name="Purpose"
                      value={values.Purpose}
                      onChange={handleChanges}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Purpose</option>
                      <option value="Purchase Goods">Purchase Goods</option>
                      <option value="Service Payment">Service Payment</option>
                      <option value="Rent Payment">Rent Payment</option>
                      <option value="Utility Bills">Utility Bills</option>
                      <option value="Employee Reimbursement">Employee Reimbursement</option>
                    </select>
                  </div>
                </div>

                {/* Paid By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Paid By <span className="text-destructive">*</span></label>
                  <Input
                    type="text"
                    name="Paid_By"
                    value={values.Paid_By}
                    onChange={handleChanges}
                    required
                    placeholder="Enter payer name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bookkeeping/Accounting Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Bookkeeping/Accounting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {values2.map((account, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Account {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Account No and Debit Amount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Account No</label>
                          <Input
                            type="number"
                            name="Account_ID"
                            value={account.Account_ID}
                            onChange={(e) => handleChanges2(e, index)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Debit Amount</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            name="Debit_Amount"
                            value={account.Debit_Amount ?? ""}
                            onKeyDown={(e) => {
                              const value = e.target.value || "";

                              if (
                                (e.key === 'Backspace' ||
                                  e.key === 'Delete' ||
                                  e.key === 'Tab' ||
                                  e.key.startsWith('Arrow'))
                              ) {
                                return;
                              }

                              if (e.key === '.' && value.includes('.')) {
                                e.preventDefault();
                                return;
                              }

                              if (!/[0-9.]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => handleChanges2(e, index)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Account Name and Credit Amount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Account Name</label>
                          <Input
                            type="text"
                            name="Account_Name"
                            value={index === 0 ? (selectedAccountName || account.Account_Name) : account.Account_Name}
                            onChange={(e) => handleChanges2(e, index)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Credit Amount</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            name="Credit_Amount"
                            value={account.Credit_Amount ?? ""}
                            onKeyDown={(e) => {
                              const value = e.target.value || "";

                              if (
                                (e.key === 'Backspace' ||
                                  e.key === 'Delete' ||
                                  e.key === 'Tab' ||
                                  e.key.startsWith('Arrow'))
                              ) {
                                return;
                              }

                              if (e.key === '.' && value.includes('.')) {
                                e.preventDefault();
                                return;
                              }

                              if (!/[0-9.]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => handleChanges2(e, index)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Check No and Check Amount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Check No</label>
                          <select
                            name="Check_No"
                            value={index === 0 ? (selectedCheckNo || account.Check_No) : account.Check_No}
                            onChange={(e) => handleChanges2(e, index)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select Check</option>
                            {checkNumbers.map((checkNo, idx) => (
                              <option key={idx} value={checkNo}>{checkNo}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Check Amount</label>
                          <Input
                            type="text"
                            name="Check_Amount"
                            value={index === 0 ? (selectedCheckAmt || account.Check_Amount) : account.Check_Amount}
                            onChange={(e) => handleChanges2(e, index)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add/Remove Account Buttons */}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={addElement}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={removeElement}
                    disabled={values2.length <= 1}
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Remove Account
                  </Button>
                </div>

                {/* Recorded By and Date Recorded */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Recorded By</label>
                    <select
                      name="Recorded_By"
                      value={values.Recorded_By}
                      onChange={handleChanges}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Barry Simmons">Barry Simmons</option>
                      <option value="Larry Smith">Larry Smith</option>
                      <option value="Lucy Parrot">Lucy Parrot</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date Recorded</label>
                    <Input
                      type="date"
                      name="Date_Recorded"
                      value={values.Date_Recorded}
                      required
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#263145] hover:bg-[#1a2332] text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Payment Voucher
              </Button>
            </div>
        </form>

        {/* Confirmation Dialog Overlay */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-[#00000078] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Save</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to save this Payment Voucher? This action will create a new payment record and cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelSave}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={confirmSave}
                  className="bg-[#263145] hover:bg-[#1a2332] text-white px-4 py-2"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Yes, Save Payment Voucher
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Dialog Overlay */}
        {showSuccessDialog && (
          <div className="fixed inset-0 bg-[#00000078] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Voucher Saved!</h3>
                  <p className="text-sm text-gray-600">Your payment voucher has been successfully created.</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                What would you like to do next?
              </p>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="button" 
                  onClick={handleViewRecords}
                  className="bg-[#263145] hover:bg-[#1a2332] text-white w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Payment Voucher Records
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCreateAnother}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Another Payment Voucher
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={closeSuccessDialog}
                  className="w-full text-gray-600"
                >
                  Stay on This Page
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default PaymentVoucher;
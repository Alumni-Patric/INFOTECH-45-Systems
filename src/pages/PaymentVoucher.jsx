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
      toast.success("Payment Voucher saved successfully!");
    } catch (e) {
      console.log(e);
      toast.error("Error saving payment voucher");
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
      toast.success("Payment Logs saved successfully");
    } catch (error) {
      console.error("Error saving Payment Logs: ", error);
      toast.error("Error saving payment logs");
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Voucher</h1>
              <p className="text-muted-foreground">Create and manage payment vouchers for various transactions</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PaymentVoucher;
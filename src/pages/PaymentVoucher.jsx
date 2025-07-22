/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../payment-voucher-css/App.css';
import { doc, setDoc, getDocs, collection} from "firebase/firestore"; // Import setDoc and doc
import { firestore} from "../firebase.js";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import Navbar from '../NewNavbar&Footer/navbar';
import Footer from '../NewNavbar&Footer/footer';

function PaymentVoucher() {
  const [collectionName] = useState("Payment Voucher"); // Define collection name

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


  const  fetchRFP = async () => {
    try{
      const querySnapshot = await getDocs(collection(firestore,"Request for Payment"));
      const dataList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      const rfpvalues = dataList.map(dataList => dataList.RFP_NO);
      const payeeName = dataList.map(dataList => dataList.PAYEE);
      const totalamnt = dataList.map(dataList => dataList.TOTALAMT);
      
      console.log("Fetched Data: ", dataList); //Debugging line
      setAttributes(rfpvalues);
      setPayee(payeeName);
      setTotalAmount(totalamnt);
      console.log(dataList);
    }catch(error){
      console.log(error);
    }
  }

  const [checkNumbers, setCheckNumbers] = useState([]);
  const [checkAmounts, setCheckAmounts] = useState([]);
  const [accountName, setAccountName] = useState([]);

  const fetchCheckNoAmount = async () =>{
    try{
      const querySnapshot = await getDocs(collection(firestore, "Request for Payment"));
      const dataList = querySnapshot.docs.map((doc) => ({
        id:doc.id,
        ...doc.data()
      }))

      const checkNos = [];
      const checkAmts = [];
      const accountNm = [];

      dataList.forEach((data) =>{
        if(Array.isArray(data.CHARGETO_ROWS)){
          //Loop through the attribute
          data.CHARGETO_ROWS.forEach((row) => {
            if(row.checkAmount && row.checkNumber && row.accountName){
              checkAmts.push(row.checkAmount);
              checkNos.push(row.checkNumber);
              accountNm.push(row.accountName);
            }
          })
        }
      })
      
      // console.log(checkNos);
      // console.log(checkAmts);

      setCheckNumbers(checkNos);
      setCheckAmounts(checkAmts);
      setAccountName(accountNm);
    }catch(error){
      console.log(error)
    }
  }

  const  handleSelectedRFP = (e) => {
    const selectedValue = e.target.value;
    setSelectedRFP(selectedValue);

    const index = attributes.findIndex((rfp) => rfp === selectedValue);

    if(index != 1){
      setSelectedPayee(payee[index]);
      setSelectedTotalAmnt(totalAmnt[index]);
      setValues((prev) => ({
        ...prev,
        RFP_NO: selectedValue,
        Name: payee[index],
        Amount: totalAmnt[index]
      }));
    }else{
      setSelectedPayee('');
      setSelectedTotalAmnt('');
      setValues((prev) => ({
        ...prev,
        RFP_NO: '',
        Name: '',
        Amount: ''
      }));
    }
  }

  // Auto-generate PV_NO when component mounts
  useEffect(() => {
    const initialPV_NO = formattedPVNo();
    setValues((prev) => ({ ...prev, PV_NO: initialPV_NO }));
  }, []);

  useEffect(() =>{
    const initialSI_No = formattedSINo();
    setValues((prev) => ({ ...prev, SI_NO: initialSI_No}));
  }, [])

  const [values, setValues] = useState({
    Name: "",
    PV_NO: "",//Auto-Generated ID
    Amount: "",
    RFP_NO: "",//Get from Purchasing
    Purpose: "",
    Paid_By: "",
    Date_Paid: "",
    Received_By:"",
    SI_NO: "",//Auto-Generated
    PV_Status: "Forwarded"
  });

  const [values2, setValues2] = useState([
    {
    Account_ID: "",
    Account_Name: "",
    Debit_Amount: "",
    Credit_Amount: "",
    Check_No:"",
    Check_Amount:"",
    Recorded_By: "Barry Simmons",
    Date_Recorded: ""
    }
  ]);


  const handleChanges = (e) => {
    setValues({...values, [e.target.name]:e.target.value})
  }

  const handleChanges2 = (e, index) => {
    const {name, value } = e.target;

    setValues2((prev) => {
      const updated = [...prev];
      if(name === "Check_No"){
        // Find the corresponding check amount for the selected check number
        const checkindex = checkNumbers.findIndex((checkNo) => checkNo === value);
        updated[index][name] = value;
        updated[index].Check_Amount = checkindex !== -1 ? checkAmounts[checkindex] : "";
        updated[index].Account_Name = checkindex !== -1 ? accountName [checkindex] : "";
      }else if (name === "Recorded_By" || name === "Date_Recorded") {
        // Update these fields for all accounts
        updated.forEach((account) => {
          account[name] = value;
        });
      }else{
        updated[index][name] = value;
      } 

      return updated;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault()
  
    const paymentCollectionRef = collection(firestore, collectionName);
  
    // Fetch all documents in the collection
    const snapshot = await getDocs(paymentCollectionRef);
  
    // Calculate the next document number dynamically
    const existingIds = snapshot.docs.map((doc) => parseInt(doc.id.split('-')[1], 10)).filter((id) => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  
    // Generate unique document IDs
    const paymentDocId = `Payment-${nextId}`;
    const accountingDocId = `Accounting-${nextId}`;
  
    // **Save the generated PV_NO and SI_NO** for reference (before resetting the form)
    const generatedPVNo = formattedPVNo();
    const generatedSINo = formattedSINo();
  
    // Update the values with the generated unique numbers
    const updatedValues = {
      ...values,
      PV_NO: generatedPVNo, // Save unique PV_NO
      SI_NO: generatedSINo   // Save unique SI_NO
    };
  
    try {
      // Save Payment Voucher to Firestore
      await setDoc(doc(firestore, collectionName, paymentDocId), updatedValues);
      console.log("Payment Voucher saved successfully!");
    } catch (e) {
      console.log(e);
    }
  
    // Proccessing values2 (Accounts data) - converting empty amounts to 0
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
  
    // Saving to Payments Logbook
    try {
      const { PV_NO, Name, Amount, Date_Paid } = updatedValues; // Use the updated values
      const docRef = doc(firestore, "Payments Logbook", `Cash_Check_Logs ${nextId}`);
  
      await setDoc(docRef, {
        PV_NO: PV_NO,
        Payee: Name,
        Amount: Amount,
        Mode: "Check",  // Can be dynamic based on your logic
        Date: Date_Paid,
        Status: "Pending"
      });
  
      console.log("Payment Log saved successfully!");
      alert("Payment Logs saved successfully");
    } catch (error) {
      console.error("Error saving Payment Logs: ", error);
    }
  
    // Reset the form after successful submission
    resetForm(generatedPVNo, generatedSINo);  // Pass generated PV_NO and SI_NO
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
        Recorded_By: "Barry Simmons", //reset to default
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
          ${values2.map( account => `
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


  const[elements, setElements] = useState([]);//state for element data (empty)
  const[count, setCount] = useState(2);

  const addElement = () => {
    setValues2((prev) => {
      const newAccount = {
        Account_ID: "",
        Account_Name: "",
        Debit_Amount: "",
        Credit_Amount: "",
        Check_No: "",
        Check_Amount: "",
        Recorded_By: prev[0]?.Recorded_By || "", // Copy from the first account
        Date_Recorded: prev[0]?.Date_Recorded || "", // Copy from the first account
      };
  
      return [...prev, newAccount];
    });
    
    setCount(count + 1);
  }

  const removeElement = () => {
    if(values2.length  > 1){
      setValues2(values2.slice(0, -1)); //remove the last element
      setCount(count - 1);
    }
  }
  useEffect(() =>{
    fetchRFP();
    fetchCheckNoAmount();
  },[]);


  return (
    <>
    <Navbar />
    <div className="container">
      <form className="payment-voucher" onSubmit={handleSubmit}>

        <h2>Payment Voucher</h2>


        <div className="pvrfp-container">
          <label htmlFor="pvno">PV No:</label>
          <input type="text" name="PV_NO" className="pvno" value={values.PV_NO}
            onChange={(e) => handleChanges(e)} required disabled />
          <label htmlFor="rfpno">RFP No:</label>
        <select  type="text" name="RFP_NO" id="rfpno" className="rfpno" value={selectedRFP} onChange={(e) => handleSelectedRFP(e)}>
          {attributes.map((rfp, index) => (
            <option key={index} value={rfp}> {rfp} </option>
          ))}
        </select>
        </div>


        <div className="payee-container">
          <label htmlFor="name">Payee:</label>
          <input type="text" name="Name"
          onChange={(e) => handleChanges(e)} value={selectedPayee} required disabled />
        </div>


        <div className="amount-container">
          <label htmlFor="amount">Total Amount:</label>
          <input type="text" name="Amount" className="amount"
          onChange={(e) => handleChanges(e)} value={selectedTotalAmnt} required disabled/>

          <label htmlFor="date">Date Paid:</label>
          <input type="date" name="Date_Paid" className="date"
          onChange={(e) => handleChanges(e)} required />
        </div>


        <div className="purpose-container">
        <label htmlFor="purpose">Purpose:</label>
        <select name="Purpose" id="purpose" className="purpose" onChange={(e) => handleChanges(e)}>
          <option value="Purchase Goods">Purchase Goods</option>
          <option value="Service Payment">Service Payment</option>
          <option value="Rent Payment">Rent Payment</option>
          <option value="Utility Bills">Utility Bills</option>
          <option value="Employee Reimbursement">Employee Reimbursement</option>
        </select>
        <label htmlFor="receive">Received by:</label>
          <input type="text" name="Received_By" className="receive"
            onChange={(e) => handleChanges(e)} required />
        </div>


        <div className="fill-container">
        <label htmlFor="paid">Paid By: <span className='treasurer'>*Treasurer</span></label>
        <input type="text" name="Paid_By" className="paid"
        onChange={(e) => handleChanges(e)} required />
        <label htmlFor="receive">SI No:</label>
          <input type="text" name="SI_NO" className="sino" value={values.SI_NO}
            onChange={(e) => handleChanges(e)} required disabled/>
        </div>
        <hr></hr>


        <h2>Bookkeeping/Accounting</h2>

        {values2.map((account, index) => (
            <div key={index} className="checkform" style={{ backgroundColor: '#f0f0f0', border: '2px solid #ccc', padding: '20px', borderRadius: '1px', marginBottom: '10px' }}>
              <div className="account-header"><span>Account {index + 1}</span></div>
              
              <div className="account-container">
                <label htmlFor={`account-${index}`}>Account No:</label>
                <input
                  type="text"
                  name="Account_ID"
                  className="account"
                  value={account.Account_ID}
                  onChange={(e) => handleChanges2(e, index)}
                  required
                />
                <label htmlFor={`debit-${index}`}>Debit Amount:</label>
                <input
                  type="text"
                  name="Debit_Amount"
                  className="debit"
                  value={account.Debit_Amount ?? ""}
                  onChange={(e) => handleChanges2(e, index)}
                  placeholder='0'
                />
              </div>

              <div className="account-container">
                <label htmlFor={`accountname-${index}`}>Account Name:</label>
                <input
                  type="text"
                  name="Account_Name"
                  className="accountname"
                  value={account.Account_Name}
                  onChange={(e) => handleChanges2(e, index)}
                  required
                />
                <label htmlFor={`credit-${index}`}>Credit Amount:</label>
                <input
                  type="text"
                  name="Credit_Amount"
                  className="credit"
                  value={account.Credit_Amount ?? ""}
                  onChange={(e) => handleChanges2(e, index)}
                  placeholder='0'
                />
              </div>

              <div className="check-container">
                <label htmlFor={`checkno-${index}`}>Check No:</label>
                <select
                  name="Check_No"
                  id={`checkno-${index}`}
                  className="checkno"
                  value={account.Check_No}
                  onChange={(e) => handleChanges2(e, index)}
                >
                  {checkNumbers.map((checkNo, idx) => (
                    <option key={idx} value={checkNo}>{checkNo}</option>
                  ))}
                </select>
                <label htmlFor={`checkamt-${index}`}>Check Amount:</label>
                <input
                  type="text"
                  name="Check_Amount"
                  className="credit"
                  value={account.Check_Amount || 0}
                  onChange={(e) => handleChanges2(e, index)}
                  disabled
                />
              </div>
            </div>
          ))}

        <div className="added_account_container">
          {elements.map((el,index) =>
          <div key={index}>
              {el}
            </div>
          )}
        </div>


        <div className="recorded-container">
        <label htmlFor="recorded">Recorded By:</label>
        <select name="Recorded_By" id="recorded" className="recorded" value={values2[0].Recorded_By} onChange={(e) => handleChanges2(e)}>
          <option value="Barry Simmons">Barry Simmons</option>
          <option value="Larry Smith">Larry Smith</option>
          <option value="Lucy Parrot">Lucy Parrot</option>
        </select>
        <label htmlFor="daterec">Date Recorded:</label>
        <input type="date" name="Date_Recorded" className="daterec"
        onChange={(e) => handleChanges2(e)} required />
        </div>


        <button type="button" className="add-button" onClick={addElement}>Add Account</button>
        <button type="button" className="remove-button" onClick={removeElement} disabled={values2.length <= 1}>Remove Account</button>

        <hr></hr>

        <button type="button" className="cancel-button">Cancel</button>
        <button type="submit" className="save-button">Save</button>
        <button type="submit" className="save-button" onClick={generateTableForPrint} >Print</button>
      </form>
    </div>
    <Footer />
    </>
  );
}

export default PaymentVoucher;
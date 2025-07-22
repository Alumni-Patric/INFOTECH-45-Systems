/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { doc, getDoc } from "firebase/firestore";

const retrieveData = async () => {
  const paymentDocId = "Payment";
  const accountingDocId = "Accounting";

  try {
    // Reference the "Payment" document
    const paymentDocRef = doc(firestore, collectionName, paymentDocId);

    // Fetch the document snapshot
    const paymentDocSnap = await getDoc(paymentDocRef);

    if (paymentDocSnap.exists()) {
      const paymentData = paymentDocSnap.data();
      console.log("Payment Data:", paymentData.entries); // Array of payment entries
    } else {
      console.log("No Payment document found!");
    }
  } catch (e) {
    console.error("Error retrieving Payment data:", e);
  }

  try {
    // Reference the "Accounting" document
    const accountingDocRef = doc(firestore, collectionName, accountingDocId);

    // Fetch the document snapshot
    const accountingDocSnap = await getDoc(accountingDocRef);

    if (accountingDocSnap.exists()) {
      const accountingData = accountingDocSnap.data();
      console.log("Accounting Data:", accountingData.entries); // Array of accounting entries
    } else {
      console.log("No Accounting document found!");
    }
  } catch (e) {
    console.error("Error retrieving Accounting data:", e);
  }
};
const handleSubmit =  async (e) => {
  e.preventDefault()

  // Create unique document IDs using timestamp
  // const timestamp = new Date().toISOString();
  const paymentDocId = "Payment";
  const accountingDocId = "Accounting";

  console.log(values)

  try {
    //Reference storage for storing data
    const paymentDocRef = doc(firestore, collectionName, paymentDocId);

    //This section will check if the 'Payment' document exists
    const paymentDocCheck = await getDoc(paymentDocRef);
    if(paymentDocCheck.exists()){
      await updateDoc(doc(firestore, collectionName, paymentDocId), {
        entries: arrayUnion(values),
    });
    } else{
      // Use setDoc to create a document with the specified ID
      await setDoc(doc(firestore, collectionName, paymentDocId), {
      entries: [values]
      });
    }  
    console.log("Payment document created successfully",values);
  } catch (e) {
    console.log("Error",e);
  }

  console.log(values2)

  try {
    //Reference storage for storing data
    const accountingDocRef = doc(firestore, collectionName, accountingDocId);

    //This section will check if the 'Accounting' document exists
    const accountingDocCheck = await getDoc(accountingDocRef);
    if(accountingDocCheck.exists()){
      await updateDoc(doc(firestore, collectionName, accountingDocId), {
        entries: arrayUnion(values2),
    });
    } else{
      // Use setDoc to create a document with the specified ID
      await setDoc(doc(firestore, collectionName, accountingDocId), {
      entries: [values2]
      });
    }  
    console.log("Payment document created successfully",values);
  } catch (e) {
    console.log("Error",e);
  }
};
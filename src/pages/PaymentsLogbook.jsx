// src/pages/PaymentsLogbook.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../firebase"; // adjust path to your Firebase config
import Navbar from "../NewNavbar&Footer/navbar";
import Footer from "../NewNavbar&Footer/footer";
import "../css/paymentslog.css";

const PaymentsLogbook = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const q = query(collection(firestore, "Payments Logbook"), orderBy("Date", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div className="p-4">Loading payments...</div>;
  }

  return (
    <>
        <Navbar />
        <div className="logbook-container">
        <p className="logbook-title">Payments Logbook</p>
        <div className="overflow-x-auto">
            <table className="logbook-table">
            <thead>
                <tr className="bg-gray-100">
                <th className="border p-2">Voucher No</th>
                <th className="border p-2">Payee</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Mode</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Status</th>
                </tr>
            </thead>
            <tbody>
                {payments.length > 0 ? (
                payments.map((payment) => (
                    <tr key={payment.id}>
                    <td>{payment.PV_NO || "-"}</td>
                    <td>{payment.Payee || "-"}</td>
                    <td>{payment.Amount || "-"}</td>
                    <td>{payment.Mode || "-"}</td>
                    <td>{payment.Date || "-"}</td>
                    <td>{payment.Status || "-"}</td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td className="text-center" colSpan="6">
                    No payments found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
        <Footer />
    </>
  );
};

export default PaymentsLogbook;

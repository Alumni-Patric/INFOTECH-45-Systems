 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection} from "firebase/firestore";
import { firestore} from "../firebase.js";

export default function PaymentVoucherTable() {

    const [paymentVouchers, setPaymentVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Payment Voucher data
    const fetchPV = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(firestore, "Payment Voucher"));
            const dataList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by date from oldest to latest
            const sortedData = dataList.sort((a, b) => {
                const dateA = new Date(a.Date_Paid || '1900-01-01');
                const dateB = new Date(b.Date_Paid || '1900-01-01');
                return dateA - dateB;
            });

            console.log("Payment Voucher data (sorted by date):", sortedData); // Debug log
            setPaymentVouchers(sortedData);
        } catch (error) {
            console.log("Error fetching Payment Vouchers:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on mount
    React.useEffect(() => {
        fetchPV();
    }, []);

    // const [vouchers] = useState(sampleVouchers);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleEdit = (id) => {
        // Navigate to edit form with voucher ID
        navigate(`/payment-voucher/edit/${id}`);
    };
    
    return (
        <div className="max-w-8xl mx-auto my-12 px-4">
            <div className="flex justify-between items-center mb-8 mt-2">
                <div>
                    <h1 className="text-3xl font-bold text-blue-800 m-0">Payment Vouchers</h1>
                    <p className="text-gray-600 text-base mt-2 mb-0">A list of all payment vouchers including their details and amounts.</p>
                </div>
                <button 
                    onClick={() => handleNavigation('/payment-voucher')} 
                    className="bg-blue-500 hover:bg-blue-800 text-white border-none py-3 px-6 rounded-lg text-base cursor-pointer font-medium transition-colors duration-200"
                >
                    Add Payment Voucher
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Voucher No</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">RFP No</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Payee</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Purpose</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Total Amount</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Date</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                    Loading payment vouchers...
                                </td>
                            </tr>
                        ) : paymentVouchers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                    No payment vouchers found
                                </td>
                            </tr>
                        ) : (
                            paymentVouchers.map((voucher, idx) => (
                                <tr key={voucher.id || idx} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="p-4 border-b border-gray-200">{voucher.PV_NO || '-'}</td>
                                    <td className="p-4 border-b border-gray-200">{voucher.RFP_NO || '-'}</td>
                                    <td className="p-4 border-b border-gray-200">{voucher.Name || '-'}</td>
                                    <td className="p-4 border-b border-gray-200">{voucher.Purpose || '-'}</td>
                                    <td className="p-4 border-b border-gray-200">
                                        {voucher.Amount !== undefined ? `₱${Number(voucher.Amount).toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-4 border-b border-gray-200">{voucher.Date_Paid || '-'}</td>
                                    <td className="p-4 border-b border-gray-200">
                                        <button
                                            onClick={() => handleEdit(voucher.PV_NO || voucher.id)}
                                            className="text-indigo-500 hover:text-indigo-700 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors duration-200"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
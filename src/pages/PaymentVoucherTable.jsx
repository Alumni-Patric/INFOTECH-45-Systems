// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection} from "firebase/firestore";
import { firestore} from "../firebase.js";

const sampleVouchers = [
    {
        id: 1,
        date: '2024-06-01',
        payee: 'John Doe',
        amount: 1500,
        description: 'Office Supplies',
    },
    {
        id: 2,
        date: '2024-06-03',
        payee: 'Jane Smith',
        amount: 2500,
        description: 'Consulting Fee',
    },
    {
        id: 3,
        date: '2024-06-05',
        payee: 'ABC Company',
        amount: 3200,
        description: 'Equipment Purchase',
    },
    {
        id: 4,
        date: '2024-06-07',
        payee: 'Marketing Agency',
        amount: 1800,
        description: 'Advertisement Campaign',
    },
    {
        id: 5,
        date: '2024-06-10',
        payee: 'Utility Company',
        amount: 450,
        description: 'Monthly Utilities',
    },
    {
        id: 6,
        date: '2024-06-12',
        payee: 'Software Vendor',
        amount: 2100,
        description: 'License Renewal',
    },
];

export default function PaymentVoucherTable() {

    // const [attributes, setAttributes] = useState([]);
    // const [payee, setPayee] = useState([]);
    // const [totalAmount, setTotalAmount] = useState([]);
    
    
    // const  fetchRFP = async () => {
    //     try{
    //       const querySnapshot = await getDocs(collection(firestore,"Payment Voucher"));
    //       const dataList = querySnapshot.docs.map((doc) => ({
    //         id: doc.id,
    //         ...doc.data()
    //       }))
    
    //       const rfpvalues = dataList.map(dataList => dataList.RFP_NO);
    //       const payeeName = dataList.map(dataList => dataList.PAYEE);
    //       const totalamnt = dataList.map(dataList => dataList.TOTALAMT);
          
    //       console.log("Fetched Data: ", dataList); //Debugging line
    //       setAttributes(rfpvalues);
    //       setPayee(payeeName);
    //       setTotalAmount(totalamnt);
    //       console.log(dataList);
    //     }catch(error){
    //       console.log(error);
    //     }
    //   }
    
    //   const [checkNumbers, setCheckNumbers] = useState([]);
    //   const [checkAmounts, setCheckAmounts] = useState([]);
    //   const [accountName, setAccountName] = useState([]);
    
    //   const fetchCheckNoAmount = async () =>{
    //     try{
    //       const querySnapshot = await getDocs(collection(firestore, "Request for Payment"));
    //       const dataList = querySnapshot.docs.map((doc) => ({
    //         id:doc.id,
    //         ...doc.data()
    //       }))
    
    //       const checkNos = [];
    //       const checkAmts = [];
    //       const accountNm = [];
    
    //       dataList.forEach((data) =>{
    //         if(Array.isArray(data.CHARGETO_ROWS)){
    //           //Loop through the attribute
    //           data.CHARGETO_ROWS.forEach((row) => {
    //             if(row.checkAmount && row.checkNumber && row.accountName){
    //               checkAmts.push(row.checkAmount);
    //               checkNos.push(row.checkNumber);
    //               accountNm.push(row.accountName);
    //             }
    //           })
    //         }
    //       })
          
    //       // console.log(checkNos);
    //       // console.log(checkAmts);
    
    //       setCheckNumbers(checkNos);
    //       setCheckAmounts(checkAmts);
    //       setAccountName(accountNm);
    //     }catch(error){
    //       console.log(error)
    //     }
    //   }

    const [vouchers] = useState(sampleVouchers);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleEdit = (id) => {
        // Navigate to edit form with voucher ID
        navigate(`/payment-voucher/edit/${id}`);
    };
    
    return (
        <div className="max-w-6xl mx-auto my-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 m-0">Payment Vouchers</h1>
                    <p className="text-gray-600 text-base mt-2 mb-0">A list of all payment vouchers including their details and amounts.</p>
                </div>
                <button 
                    onClick={() => handleNavigation('/payment-voucher')} 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white border-none py-3 px-6 rounded-lg text-base cursor-pointer font-medium transition-colors duration-200"
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
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((voucher) => (
                            <tr key={voucher.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-4 border-b border-gray-200">#{voucher.id.toString().padStart(3, '0')}</td>
                                <td className="p-4 border-b border-gray-200">{voucher.date}</td>
                                <td className="p-4 border-b border-gray-200">{voucher.payee}</td>
                                <td className="p-4 border-b border-gray-200">${voucher.amount.toLocaleString()}</td>
                                <td className="p-4 border-b border-gray-200">{voucher.description}</td>
                                <td className="p-4 border-b border-gray-200">
                                    <button 
                                        onClick={() => handleEdit(voucher.id)}
                                        className="text-indigo-500 hover:text-indigo-700 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors duration-200"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Voucher ID</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Date</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Payee</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Amount</th>
                            <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Description</th>
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
                                        Edit
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
import React, { useEffect, useState } from "react";
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { Link } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore"; // Import setDoc and doc
import { firestore } from "../firebase.js";


function PayslipUI() {
    const [payslips, setPayslips] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [filePath, setFilePath] = useState("");

    useEffect(() => {
        const fetchPayslips = async () => {
            try {
                const payslipList = await getDocs(collection(firestore, "Payslip"));
                const dataList = payslipList.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPayslips(dataList);
            } catch (error) {
                console.error("Error fetching payslips:", error);
                setPayslips([]);
            }
        };
        fetchPayslips();
    }, []);

    const filteredPayslips = payslips
        .filter(p => p.employeeName?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            // Sort by creation timestamp if available, otherwise by ID (newest first)
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // If no timestamp, sort by ID (assuming newer IDs are created later)
            return b.id.localeCompare(a.id);
        });

    const openModal = (payslip) => {
        setSelectedPayslip(payslip);
        setFilePath(payslip.filePath || "");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPayslip(null);
        setFilePath("");
    };

    const handleSave = () => {
        if (selectedPayslip && filePath.trim()) {
            const updatedPayslips = payslips.map(p =>
                p.id === selectedPayslip.id
                    ? { ...p, filePath: filePath.trim() }
                    : p
            );
            setPayslips(updatedPayslips);
        }
        closeModal();
    };

    return (
        <>
            <Navbar />
            <div className="min-h-[650px] text-black mx-10 p-6">
                <div className="flex justify-between">
                    <div className="flex-1">
                        <h2 className="p-0 m-0 text-[36px]">Payslip</h2>
                        <span className="text-[#797979] text-base">Detailed records of employment earnings and deductions</span>
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <Link to="/payslip-form">
                            <button className="bg-[#022073] text-white rounded-full py-2.5 px-5 text-base font-semibold border-none cursor-pointer hover:bg-[#3e63cb] transition-colors">
                                Go to Payslip Form
                            </button>
                        </Link>
                        <div className="relative">
                            <input
                                className="w-[400px] h-10 pl-12 pr-4 py-4 border border-black rounded-full text-base"
                                placeholder="Search"
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <svg
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="mt-12">
                    <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
                        {/* Fixed Header Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse border-spacing-0">
                                <thead>
                                    <tr className="h-[67px] bg-[#F6F9F8] text-[#797979]">
                                        <th className="font-normal p-2 min-w-[200px]">
                                            <label className="inline-flex items-center gap-1.5 text-base text-[#797979] font-normal">
                                                <input type="checkbox" id="select-all" className="h-4 w-4" />
                                                <span>Name</span>
                                            </label>
                                        </th>
                                        <th className="font-normal p-2 min-w-[150px]">Department</th>
                                        <th className="font-normal p-2 min-w-[150px]">Payment Date</th>
                                        <th className="font-normal p-2 min-w-[100px]">Status</th>
                                        <th className="font-normal p-2 min-w-[120px]">Action</th>
                                        <th className="font-normal p-2 min-w-[150px]">Signature</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto max-h-[500px]">
                            <table className="w-full text-center border-collapse border-spacing-0">
                                <tbody>
                                    {filteredPayslips.map((payslip) => (
                                        <tr className="h-[67px] text-black hover:bg-gray-50" key={payslip.id}>
                                            <td className="p-2 border-b border-[#E8E8E8] min-w-[200px]">
                                                <label className="inline-flex items-center gap-1.5 text-base text-black font-semibold">
                                                    <input type="checkbox" className="h-4 w-4" />
                                                    <span>{payslip.employeeName}</span>
                                                </label>
                                            </td>
                                            <td className="p-2 border-b border-[#E8E8E8] min-w-[150px]">{payslip.designation}</td>
                                            <td className="p-2 border-b border-[#E8E8E8] min-w-[150px]">{payslip.paymentDate}</td>
                                            <td className={`p-2 border-b border-[#E8E8E8] min-w-[100px] ${payslip.status === "Paid"
                                                ? "text-green-600"
                                                : payslip.status === "Overdue"
                                                    ? "text-red-600"
                                                    : "text-orange-500"
                                                }`}>
                                                {payslip.status}
                                            </td>
                                            <td className="p-2 border-b border-[#E8E8E8] min-w-[120px]">
                                                <Link to={`/payslip/${payslip.id}`} className="text-[#2A03A9] underline font-semibold cursor-pointer">
                                                    View Payslip
                                                </Link>
                                            </td>
                                            <td className="p-2 border-b border-[#E8E8E8] min-w-[150px]">
                                                <button
                                                    className="bg-[#022073] text-white border-none rounded px-4 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-[#3e63cb]"
                                                    onClick={() => openModal(payslip)}
                                                >
                                                    {payslip.filePath ? "Edit Signature" : "Add Signature"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Path Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]" onClick={closeModal}>
                    <div className="bg-white rounded-lg w-[90%] max-w-[500px] shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 pb-6 border-b border-[#E8E8E8]">
                            <h3 className="m-0 text-lg font-semibold text-[#333]">File Path Upload</h3>
                            <button className="bg-none border-none text-2xl cursor-pointer text-[#666] p-0 w-8 h-8 flex items-center justify-center hover:text-[#333]" onClick={closeModal}>×</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-5">
                                <label htmlFor="filePathInput" className="block mb-2 font-medium text-[#333]">File Path:</label>
                                <input
                                    type="text"
                                    id="filePathInput"
                                    className="w-full h-10 px-3 py-2 border border-[#E8E8E8] rounded text-sm box-border focus:outline-none focus:border-[#022073] focus:shadow-[0_0_0_2px_rgba(2,32,115,0.1)]"
                                    placeholder="Enter file path"
                                    value={filePath}
                                    onChange={(e) => setFilePath(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-5 pt-6 border-t border-[#E8E8E8]">
                            <button className="py-2.5 px-5 rounded text-sm font-medium cursor-pointer border-none transition-colors bg-[#f5f5f5] text-[#333] hover:bg-[#e8e8e8]" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="py-2.5 px-5 rounded text-sm font-medium cursor-pointer border-none transition-colors bg-[#022073] text-white hover:bg-[#3e63cb]" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
export default PayslipUI;
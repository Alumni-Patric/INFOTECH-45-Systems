import React, { useEffect, useState } from "react";
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { Link } from "react-router-dom";
import { getDocs, collection, onSnapshot } from "firebase/firestore"; // Import setDoc and doc
import { firestore } from "../firebase.js";


function PayslipUI() {
    const [payslips, setPayslips] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [filePath, setFilePath] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [signatureFilter, setSignatureFilter] = useState("all");

    useEffect(() => {
        setIsLoading(true);

        // Set up real-time listener for payslips
        const unsubscribe = onSnapshot(
            collection(firestore, "Payslip"),
            (snapshot) => {
                const dataList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPayslips(dataList);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching payslips:", error);
                setPayslips([]);
                setIsLoading(false);
            }
        );

        // Cleanup function to unsubscribe when component unmounts
        return () => unsubscribe();
    }, []);

    const filteredPayslips = payslips
        .filter(p => p.Employee_Name?.toLowerCase().includes(search.toLowerCase()))
        .filter(p => {
            // Status filter
            if (statusFilter !== "all" && p.Status !== statusFilter) {
                return false;
            }
            // Signature filter
            if (signatureFilter === "hasSignature" && !p.filePath) {
                return false;
            }
            if (signatureFilter === "noSignature" && p.filePath) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            // Sort by creation timestamp if available, otherwise by ID (newest first)
            if (a.CreatedAt && b.CreatedAt) {
                return new Date(b.CreatedAt) - new Date(a.CreatedAt);
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
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <h2 className="p-0 m-0 text-[36px] font-bold">Payslip</h2>
                        <span className="text-[#797979] text-base">Detailed records of employment earnings and deductions</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/payslip-form">
                            <button className="bg-[#022073] text-white rounded-full py-2.5 px-5 text-base font-semibold border-none cursor-pointer hover:bg-blue-800 transition-colors whitespace-nowrap flex-shrink-0">
                                Go to Payslip Form
                            </button>
                        </Link>
                        <Link to="/">
                            <button className="bg-gray-500 text-white rounded-full py-2.5 px-5 text-base font-semibold border-none cursor-pointer hover:bg-gray-600 transition-colors whitespace-nowrap flex-shrink-0">
                                Go Back
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="mt-8 flex items-center gap-3 justify-end">
                    {/* Status Filter */}
                    <div className="relative w-[140px] cursor-pointer">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#022073] focus:ring-2 focus:ring-[#022073]/20 bg-white w-full appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#022073]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                    </div>

                    {/* Signature Filter */}
                    <div className="relative w-[180px] cursor-pointer">
                        <select
                            value={signatureFilter}
                            onChange={(e) => setSignatureFilter(e.target.value)}
                            className="h-10 pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#022073] focus:ring-2 focus:ring-[#022073]/20 bg-white w-full appearance-none cursor-pointer"
                        >
                            <option value="all">All Signatures</option>
                            <option value="hasSignature">Has Signature</option>
                            <option value="noSignature">No Signature</option>
                        </select>
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#022073]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                    </div>

                    {/* Search */}
                    <div className="relative w-[250px]">
                        <input
                            className="w-full h-10 pl-12 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#022073] focus:ring-2 focus:ring-[#022073]/20 bg-white"
                            placeholder="Search by name..."
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#022073]"
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
                <div className="mt-5">
                    <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
                        {/* Fixed Header Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse border-spacing-0 table-fixed">
                                <colgroup>
                                    <col style={{ width: '200px' }} />
                                    <col style={{ width: '150px' }} />
                                    <col style={{ width: '150px' }} />
                                    <col style={{ width: '100px' }} />
                                    <col style={{ width: '120px' }} />
                                    <col style={{ width: '150px' }} />
                                </colgroup>
                                <thead>
                                    <tr className="h-[67px] bg-[#F6F9F8] text-[#797979]">
                                        <th className="font-normal p-2">
                                            <label className="inline-flex items-center gap-1.5 text-base text-[#797979] font-normal">
                                                <span>Name</span>
                                            </label>
                                        </th>
                                        <th className="font-normal p-2">Designation</th>
                                        <th className="font-normal p-2">Payment Period</th>
                                        <th className="font-normal p-2">Status</th>
                                        <th className="font-normal p-2">Action</th>
                                        <th className="font-normal p-2">Signature</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto max-h-[500px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022073]"></div>
                                        <p className="text-gray-600 text-lg">Loading payslips...</p>
                                    </div>
                                </div>
                            ) : filteredPayslips.length === 0 ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <p className="text-gray-500 text-lg">No payslips found</p>
                                        <p className="text-gray-400 text-sm mt-2">Create your first payslip using the form above</p>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full text-center border-collapse border-spacing-0 table-fixed">
                                    <colgroup>
                                        <col style={{ width: '200px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                        <col style={{ width: '150px' }} />
                                    </colgroup>
                                    <tbody>
                                        {filteredPayslips.map((payslip) => (
                                            <tr className="h-[67px] text-black hover:bg-gray-50" key={payslip.id}>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <label className="inline-flex items-center gap-1.5 text-base text-black font-semibold">
                                                        <span>{payslip.Employee_Name}</span>
                                                    </label>
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">{payslip.Designation}</td>
                                                <td className="p-2 border-b border-[#E8E8E8]">{payslip.Payment_Period}</td>
                                                <td className={`p-2 border-b border-[#E8E8E8] ${payslip.Status === "Paid"
                                                    ? "text-green-600"
                                                    : payslip.Status === "Overdue"
                                                        ? "text-red-600"
                                                        : "text-orange-500"
                                                    }`}>
                                                    {payslip.Status}
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <Link to={`/payslip/${payslip.id}`} className="text-[#2A03A9] underline font-semibold cursor-pointer">
                                                        View Payslip
                                                    </Link>
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
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
                            )}
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
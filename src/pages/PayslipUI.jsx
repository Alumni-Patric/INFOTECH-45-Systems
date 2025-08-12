import React, { useEffect, useState } from "react";
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { Link } from "react-router-dom";
import { getDocs, collection, onSnapshot } from "firebase/firestore"; // Import setDoc and doc
import { firestore } from "../firebase.js";


function PayslipUI() {
    const [payslips, setPayslips] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");


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
            if (statusFilter === "Approved") {
                return p.signature; // Show only payslips with signatures
            } else if (statusFilter === "Pending") {
                return !p.signature && p.Status === "Pending"; // Show only pending payslips without signatures
            } else if (statusFilter === "all") {
                return true; // Show all payslips
            }
            return false;
        })
        .sort((a, b) => {
            // Sort by creation timestamp if available, otherwise by ID (newest first)
            if (a.CreatedAt && b.CreatedAt) {
                return new Date(b.CreatedAt) - new Date(a.CreatedAt);
            }
            // If no timestamp, sort by ID (assuming newer IDs are created later)
            return b.id.localeCompare(a.id);
        });



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
                        <Link to="/">
                            <button className="bg-gray-500 text-white rounded-lg py-2.5 px-5 text-base font-semibold border-none cursor-pointer hover:bg-gray-600 transition-colors whitespace-nowrap flex-shrink-0">
                                Go Back
                            </button>
                        </Link>
                        <Link to="/payslip-form">
                            <button className="bg-[#022073] text-white rounded-lg py-2.5 px-5 text-base font-semibold border-none cursor-pointer hover:bg-blue-800 transition-colors whitespace-nowrap flex-shrink-0">
                                Create Payslip
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
                            <option value="Approved">Approved</option>
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
                                </colgroup>
                                <thead>
                                    <tr className="h-[67px] bg-[#F6F9F8] text-[#797979]">
                                        <th className="font-normal p-2">
                                            <label className="inline-flex items-center gap-1.5 text-base text-gray-700 font-normal">
                                                <span>Name</span>
                                            </label>
                                        </th>
                                        <th className="font-normal p-2 text-gray-700">Designation</th>
                                        <th className="font-normal p-2 text-gray-700">Payment Period</th>
                                        <th className="font-normal p-2 text-gray-700">Status</th>
                                        <th className="font-normal p-2 text-gray-700">Action</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto max-h-[500px]">
                            {isLoading ? (
                                <table className="w-full text-center border-collapse border-spacing-0 table-fixed">
                                    <colgroup>
                                        <col style={{ width: '200px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '150px' }} />
                                        <col style={{ width: '100px' }} />
                                        <col style={{ width: '120px' }} />
                                    </colgroup>
                                    <tbody>
                                        {[...Array(5)].map((_, index) => (
                                            <tr className="h-[67px] text-black" key={index}>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-24"></div>
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-20"></div>
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-28"></div>
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-20"></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                                <td className={`p-2 border-b border-[#E8E8E8] ${payslip.signature
                                                    ? "text-green-600"
                                                    : "text-orange-500"
                                                    }`}>
                                                    {payslip.signature ? "Approved" : "Pending"}
                                                </td>
                                                <td className="p-2 border-b border-[#E8E8E8]">
                                                    <Link to={`/payslip/${payslip.id}`} className="text-[#2A03A9] underline font-semibold cursor-pointer">
                                                        View Payslip
                                                    </Link>
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



            <Footer />
        </>
    );
}
export default PayslipUI;
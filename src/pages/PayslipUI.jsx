import React, { useEffect, useState } from "react";
import Navbar from "../NewNavbar&Footer/navbar.jsx";
import Footer from "../NewNavbar&Footer/footer.jsx";
import { Link } from "react-router-dom";
import "../css/psui.css";
import { getDocs, collection} from "firebase/firestore"; // Import setDoc and doc
import { firestore} from "../firebase.js";


function PayslipUI() {
    const [payslips, setPayslips] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchPayslips = async () => {
            const payslipList = await getDocs(collection(firestore,"Payslip"));
            const dataList = payslipList.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setPayslips(dataList);
        };
        fetchPayslips();
    }, []);

    const filteredPayslips = payslips.filter(p =>
        p.employeeName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="psui-container">
                <div className="topbar">
                    <div className="topbar-left">
                        <h2 className="psui-h2">Payslip</h2>
                        <span className="psui-small-desc">Detailed records of employment earnings and deductions</span>
                    </div>
                    <div className="topbar-right">
                        <Link to="/payslip-form">
                            <button className="psui-topbar-button">
                                Go to Payslip Form
                            </button>
                        </Link>
                        <input
                            className="searchbar"
                            placeholder="Search"
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="psui-content">
                    <table>
                        <thead>
                            <tr className="header-row">
                                <th>
                                    <label className="psui-header-label">
                                        <input type="checkbox" id="select-all" />
                                        <span>Name</span>
                                    </label>
                                </th>
                                <th>Department</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayslips.map((payslip) => (
                                <tr className="content-row" key={payslip.id}>
                                    <td>
                                        <label className="psui-content-label">
                                            <input type="checkbox" className="row-checkbox" />
                                            <span>{payslip.employeeName}</span>
                                        </label>
                                    </td>
                                    <td>{payslip.designation}</td>
                                    <td>{payslip.paymentDate}</td>
                                    <td className={
                                        payslip.status === "Paid"
                                            ? "status-paid"
                                            : payslip.status === "Overdue"
                                            ? "status-overdue"
                                            : "status-pending"
                                    }>
                                        {payslip.status}
                                    </td>
                                    <td className="view-payslip-link">
                                        <Link to={`/payslip/${payslip.id}`}>View Payslip</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
}
export default PayslipUI;
// eslint-disable-next-line no-unused-vars
import React from 'react';
import PaymentVoucher from './pages/PaymentVoucher';
import PaymentVoucherTable from './pages/PaymentVoucherTable';
import PaymentVoucherForm from './pages/PaymentVoucherForm';
import PayslipUI from './pages/PayslipUI';
import Payslip from "./pages/Payslip";
import PayslipForm from "./pages/PayslipForm";
import PaymentsLogbook from './pages/PaymentsLogbook';
import PVHomePage from './pages/PVHomePage';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App()
{
  return(
    <Router>
      <Routes>
        <Route path="/" element={<PVHomePage />} />
        <Route path="/payment-voucher" element={<PaymentVoucher />} />
        <Route path="/payment-voucher-table" element={<PaymentVoucherTable />} />
        <Route path="/payment-voucher-form/:id?" element={<PaymentVoucherForm />} />
        <Route path="/paymentslogbook" element={<PaymentsLogbook />} />
        <Route path="/payslipUI" element={<PayslipUI />} />
        <Route path="/payslip-form" element={<PayslipForm />} />
        <Route path="/payslip/:payslipId" element={<Payslip />} />
      </Routes>
    </Router>
  )
}
export default App;
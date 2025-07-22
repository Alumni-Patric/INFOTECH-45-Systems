import React from 'react';
import PaymentVoucher from './pages/PaymentVoucher';
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
        <Route path="/paymentslogbook" element={<PaymentsLogbook />} />
        <Route path="/payslipUI" element={<PayslipUI />} />
        <Route path="/payslip-form" element={<PayslipForm />} />
        <Route path="/payslip/:id" element={<Payslip />} />
      </Routes>
    </Router>
  )
}
export default App;
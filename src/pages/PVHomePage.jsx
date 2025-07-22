// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../NewNavbar&Footer/navbar';

const PVHomePage = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <>
            <Navbar />
       
            <div style={{ textAlign: 'center', marginTop: '10%' }}>
                <h1>Welcome to the Payment System</h1>
                <p>Please select a page to proceed:</p>
                <div style={{ marginTop: '20px' }}>
                    <button
                        style={{
                            padding: '10px 20px',
                            margin: '10px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            borderRadius: '15px',
                        }}
                        onClick={() => handleNavigation('/payment-voucher')}
                    >
                        Payment Voucher Page
                    </button>
                    <button
                        style={{
                            padding: '10px 20px',
                            margin: '10px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            borderRadius: '15px',
                        }}
                        onClick={() => handleNavigation('/payslipUI')}
                    >
                        Payslip Page
                    </button>
                </div>
            </div>
        </>
    );
};

export default PVHomePage;
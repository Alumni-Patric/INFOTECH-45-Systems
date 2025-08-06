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
       
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem', backgroundColor: '#F9FAFB' }}>
                <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#FFFFFF', borderRadius: '0.75rem', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}>
                    {/* Header Section */}
                    <div style={{ backgroundColor: '#283144', padding: '2rem', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#FFFFFF' }}>Welcome to the Payment System</h1>
                        <p style={{ fontSize: '1.125rem', color: '#E5E7EB', marginTop: '0.5rem' }}>Please select an option to proceed</p>
                    </div>

                    {/* Button Section */}
                    <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <button 
                            style={{
                                width: '200px',
                                height: '200px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                transition: 'all 0.2s ease-in-out',
                            }}
                            onClick={() => handleNavigation('/payment-voucher-table')}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '4rem', height: '4rem', color: '#4B5563' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <span style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1F2937' }}>Payment Voucher</span>
                        </button>
                        <button
                            style={{
                                width: '200px',
                                height: '200px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                transition: 'all 0.2s ease-in-out',
                            }}
                            onClick={() => handleNavigation('/payslipUI')}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '4rem', height: '4rem', color: '#4B5563' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <span style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1F2937' }}>Payslip</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PVHomePage;

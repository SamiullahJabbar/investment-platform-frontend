import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../api/baseURL';

// 🚨 Utility function to decode JWT token 🚨
const jwtDecode = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

// --- COLOR CONSTANTS (Same as before) ---
const PURPLE_PRIMARY = '#8B5CF6'; 
const PURPLE_DARK = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const DARK_BG = '#0F0F23';       
const FORM_CARD_BG = '#1A1B2F';   
const TEXT_LIGHT = '#F8FAFC';     
const TEXT_GRAY = '#94A3B8';
const TEXT_DARK_GRAY = '#64748B';
const SUCCESS_GREEN = '#10B981';
const ERROR_RED = '#EF4444';
const WARNING_AMBER = '#F59E0B';


function WithdrawPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab] = useState('deposit'); 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [step, setStep] = useState(1); // 1: Method Select, 2: Details Fill, 3: Success

  // Form State
  const [form, setForm] = useState({
    amount: '',
    method: 'BankTransfer', // Default selection
    bank_name: '',
    account_owner: '',
    bank_account: ''
  });

  // Available Methods for Step 1 UI
  const paymentMethods = useMemo(() => [
    { id: 'BankTransfer', name: 'Bank Transfer', icon: '🏦', details: 'Full name, Bank Name, Account/IBAN' },
    { id: 'JazzCash', name: 'JazzCash', icon: '📱', details: 'Full name, Phone Number' },
    { id: 'EasyPaisa', name: 'EasyPaisa', icon: '💸', details: 'Full name, Phone Number' },
  ], []);


  // --- Authentication and Setup ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const token = sessionStorage.getItem('accessToken');
    
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedPayload = jwtDecode(token);
    
    if (decodedPayload) {
        setUserData({ 
            first_name: decodedPayload.first_name || decodedPayload.name, 
            username: decodedPayload.username || decodedPayload.sub
        });
    } else {
        setUserData({ first_name: 'Authenticated' }); 
    }
    
    setAuthLoading(false);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const isMobile = windowWidth <= 768;

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleNavigation = (tab) => {
    if (tab === 'home') navigate('/');
    else if (tab === 'invest') navigate('/invest');
    else if (tab === 'history') navigate('/DepositHistory'); 
    else if (tab === 'profile') navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Reset form details when method changes in Step 1
  const handleMethodChange = (methodId) => {
      setForm(prev => ({ 
          ...prev, 
          method: methodId,
          // Clear payment details fields when method is switched
          bank_name: '',
          account_owner: '',
          bank_account: ''
      }));
      setMessage({ text: '', type: '' });
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const token = sessionStorage.getItem('accessToken');

    try {
        const payload = {
            amount: parseFloat(form.amount),
            method: form.method,
            bank_name: form.method === 'BankTransfer' ? form.bank_name : undefined, // Only include for BankTransfer
            account_owner: form.account_owner,
            bank_account: form.bank_account
        };
        
        // Remove undefined fields for cleaner payload
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const response = await axios.post(`${BASE_URL}/transactions/withdraw/`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Success: Move to Step 3 (Success Screen)
        setMessage({ 
            text: response.data.message || 'Withdrawal request submitted.', 
            type: 'success' 
        });
        setStep(3); 
        
    } catch (error) {
        console.error('Withdrawal failed:', error);

        let errorText = 'Withdrawal failed. Please try again.';
        if (error.response?.data?.error) {
            errorText = error.response.data.error;
        } else if (error.response?.status === 401) {
            errorText = 'Session expired. Redirecting to login.';
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 1500);
        }

        setMessage({ text: errorText, type: 'error' });
        setStep(2); // Stay on step 2 to fix the error
    } finally {
        setLoading(false);
    }
  };

  // --- STYLES (Common Styles) ---
  const commonStyles = {
    // ... (All existing styles copied to avoid repetition issues)
    container: {
      minHeight: '100vh',
      background: DARK_BG,
      color: TEXT_LIGHT,
      fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
      position: 'relative',
      paddingBottom: '90px'
    },
    header: {
      padding: '20px 16px 16px',
      background: 'rgba(26, 27, 47, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${TEXT_DARK_GRAY}30`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      animation: 'slideDown 0.6s ease-out'
    },
    headerLeft: {
      flex: 1
    },
    welcomeText: {
      fontSize: '14px',
      color: TEXT_GRAY,
      marginBottom: '4px'
    },
    userName: {
      fontSize: '20px',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${TEXT_LIGHT}, ${PURPLE_LIGHT})`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    notificationBtn: {
      background: 'rgba(139, 92, 246, 0.2)',
      border: `1px solid ${PURPLE_PRIMARY}30`,
      borderRadius: '50%',
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.3s ease'
    },
    mainContent: {
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      maxWidth: '500px',
      margin: '0 auto'
    },
    pageTitle: {
      fontSize: isMobile ? '1.8rem' : '2.2rem',
      fontWeight: '800',
      color: TEXT_LIGHT,
      marginBottom: '0.5rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    pageSubtitle: {
      fontSize: '1rem',
      color: TEXT_GRAY,
      textAlign: 'center',
      marginBottom: '2.5rem',
      fontWeight: '400'
    },
    formCard: {
      background: FORM_CARD_BG,
      borderRadius: '20px',
      padding: isMobile ? '1.5rem' : '2.5rem',
      border: `1px solid ${TEXT_DARK_GRAY}30`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.6s ease-out 0.2s both'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: TEXT_LIGHT,
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: DARK_BG,
      border: `1px solid ${TEXT_DARK_GRAY}`,
      borderRadius: '10px',
      color: TEXT_LIGHT,
      fontSize: '1rem',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      outline: 'none'
    },
    inputFocus: {
      borderColor: PURPLE_PRIMARY,
      boxShadow: `0 0 0 3px ${PURPLE_PRIMARY}30`
    },
    messageBox: (type) => ({
      padding: '1rem',
      borderRadius: '10px',
      marginBottom: '1.5rem',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '0.95rem',
      ...(type === 'success' && {
        backgroundColor: SUCCESS_GREEN + '1A',
        color: SUCCESS_GREEN,
        border: `1px solid ${SUCCESS_GREEN}50`
      }),
      ...(type === 'error' && {
        backgroundColor: ERROR_RED + '1A',
        color: ERROR_RED,
        border: `1px solid ${ERROR_RED}50`
      })
    }),
    button: {
      width: '100%',
      padding: '1rem',
      backgroundColor: PURPLE_PRIMARY,
      color: TEXT_LIGHT,
      border: 'none',
      borderRadius: '10px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem'
    },
    buttonHover: {
      backgroundColor: PURPLE_DARK,
      transform: 'translateY(-1px)'
    },
    buttonDisabled: {
      backgroundColor: TEXT_DARK_GRAY,
      cursor: 'not-allowed'
    },
    bottomNav: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '85px',
      background: 'rgba(26, 27, 47, 0.95)',
      backdropFilter: 'blur(25px)',
      borderTop: `1px solid ${TEXT_DARK_GRAY}30`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '12px 0',
      boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.3)',
      zIndex: 1000
    },
    navItem: {
      textAlign: 'center',
      cursor: 'pointer',
      padding: '12px 14px',
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flex: 1,
      margin: '0 6px'
    },
    navItemActive: {
      background: 'rgba(139, 92, 246, 0.2)',
      border: `1px solid ${PURPLE_PRIMARY}40`,
      transform: 'translateY(-6px)'
    },
    navIcon: {
      fontSize: '24px',
      marginBottom: '6px',
      transition: 'all 0.3s ease'
    },
    navIconActive: {
      transform: 'scale(1.15)'
    },
    navLabel: {
      fontSize: '11px',
      fontWeight: '500',
      color: TEXT_GRAY,
      transition: 'all 0.3s ease'
    },
    navLabelActive: {
      color: PURPLE_PRIMARY,
      fontWeight: '700'
    },
    // NEW STEPPER/WIZARD STYLES
    stepContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        padding: '0 10px',
        animation: 'slideDown 0.5s ease-out'
    },
    stepItem: (isActive, isComplete) => ({
        flex: 1,
        textAlign: 'center',
        padding: '0 5px',
        position: 'relative',
        cursor: isComplete ? 'pointer' : 'default',
        color: isActive ? PURPLE_PRIMARY : isComplete ? TEXT_GRAY : TEXT_DARK_GRAY
    }),
    stepLine: {
        position: 'absolute',
        top: '12px',
        left: '50%',
        right: '-50%',
        height: '2px',
        backgroundColor: TEXT_DARK_GRAY + '50',
        zIndex: 1
    },
    stepLineActive: (isComplete) => ({
        backgroundColor: isComplete ? SUCCESS_GREEN : PURPLE_PRIMARY,
        transition: 'background-color 0.4s ease'
    }),
    stepCircle: (isActive, isComplete) => ({
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: isActive ? PURPLE_PRIMARY : isComplete ? SUCCESS_GREEN : FORM_CARD_BG,
        border: `2px solid ${isActive ? PURPLE_PRIMARY : isComplete ? SUCCESS_GREEN : TEXT_DARK_GRAY}`,
        color: TEXT_LIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 8px',
        position: 'relative',
        zIndex: 2,
        fontWeight: '700',
        fontSize: '14px',
        transition: 'all 0.3s ease'
    }),
    // New Method Card Style for Step 1
    methodCard: (isSelected) => ({
        background: isSelected ? 'rgba(139, 92, 246, 0.2)' : FORM_CARD_BG,
        border: `2px solid ${isSelected ? PURPLE_PRIMARY : TEXT_DARK_GRAY + '30'}`,
        borderRadius: '16px',
        padding: '1.2rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isSelected ? `0 0 15px ${PURPLE_PRIMARY}30` : 'none'
    }),
    methodIcon: {
        fontSize: '1.8rem',
        marginRight: '1rem'
    },
    methodName: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: TEXT_LIGHT
    },
    methodDetails: {
        fontSize: '0.8rem',
        color: TEXT_GRAY
    },
    // Success Screen Styles (Step 3)
    successScreen: {
        textAlign: 'center',
        padding: '3rem 1.5rem',
        background: FORM_CARD_BG,
        borderRadius: '20px',
        border: `1px solid ${SUCCESS_GREEN}50`,
        animation: 'slideUp 0.6s ease-out 0.4s both'
    },
    successIcon: {
        fontSize: '4rem',
        color: SUCCESS_GREEN,
        marginBottom: '1rem'
    },
    successTitle: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: SUCCESS_GREEN,
        marginBottom: '0.75rem'
    },
    successMessage: {
        fontSize: '1rem',
        color: TEXT_GRAY,
        marginBottom: '1.5rem',
        lineHeight: '1.6'
    }
  };


  // --- STEP 1: Method Selection ---
  const renderStep1 = () => (
    <div style={{ animation: 'slideUp 0.5s ease-out' }}>
      <h3 style={{ ...commonStyles.label, fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        Step 1: Choose Withdrawal Method
      </h3>
      {paymentMethods.map(method => (
        <div
          key={method.id}
          style={commonStyles.methodCard(form.method === method.id)}
          onClick={() => handleMethodChange(method.id)}
        >
          <span style={commonStyles.methodIcon}>{method.icon}</span>
          <div>
            <div style={commonStyles.methodName}>{method.name}</div>
            <div style={commonStyles.methodDetails}>Requires: {method.details}</div>
          </div>
        </div>
      ))}

      <button
        style={commonStyles.button}
        onClick={() => setStep(2)}
      >
        Next: Enter Details
      </button>
    </div>
  );

  // --- STEP 2: Details and Amount ---
  const renderStep2 = () => {
    const selectedMethod = paymentMethods.find(m => m.id === form.method);
    const isFormValid = form.amount > 0 && form.account_owner && form.bank_account && (form.method !== 'BankTransfer' || form.bank_name);

    return (
        <form onSubmit={handleSubmit} style={{ animation: 'slideUp 0.5s ease-out' }}>
            <h3 style={{ ...commonStyles.label, fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                Step 2: Enter {selectedMethod.name} Details
            </h3>

            {message.text && (
                <div style={commonStyles.messageBox(message.type)}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Amount */}
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label} htmlFor="amount">Withdrawal Amount (Rs)</label>
                <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Minimum 100 Rs"
                    required
                    min="100"
                    style={commonStyles.input}
                />
            </div>

            {/* Bank Name (Only for Bank Transfer) */}
            {form.method === 'BankTransfer' && (
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label} htmlFor="bank_name">Bank Name</label>
                    <input
                        id="bank_name"
                        type="text"
                        name="bank_name"
                        value={form.bank_name}
                        onChange={handleChange}
                        placeholder="e.g., Meezan Bank"
                        required
                        style={commonStyles.input}
                    />
                </div>
            )}

            {/* Account Owner Name */}
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label} htmlFor="account_owner">Account Holder Name (Full Name)</label>
                <input
                    id="account_owner"
                    type="text"
                    name="account_owner"
                    value={form.account_owner}
                    onChange={handleChange}
                    placeholder="e.g., Samiullah Khan"
                    required
                    style={commonStyles.input}
                />
            </div>

            {/* Account/Phone Number */}
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label} htmlFor="bank_account">
                    {form.method === 'BankTransfer' ? 'Bank Account / IBAN' : `${selectedMethod.name} Phone Number`}
                </label>
                <input
                    id="bank_account"
                    type={form.method === 'BankTransfer' ? 'text' : 'tel'}
                    name="bank_account"
                    value={form.bank_account}
                    onChange={handleChange}
                    placeholder={form.method === 'BankTransfer' ? 'PKR1234567890' : '03XXXXXXXXX'}
                    required
                    style={commonStyles.input}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                    type="button"
                    style={{ ...commonStyles.button, backgroundColor: TEXT_DARK_GRAY, flex: 1 }}
                    onClick={() => setStep(1)}
                >
                    ⬅️ Back
                </button>

                <button
                    type="submit"
                    disabled={loading || !isFormValid}
                    style={
                        loading || !isFormValid
                        ? { ...commonStyles.button, ...commonStyles.buttonDisabled, flex: 1 } 
                        : { ...commonStyles.button, flex: 1 }
                    }
                >
                    {loading ? (
                        <>
                            <div style={{ width: '20px', height: '20px', border: '2px solid #fff3', borderTop: '2px solid #FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            Processing...
                        </>
                    ) : (
                        `Withdraw Rs${form.amount || '...'}`
                    )}
                </button>
            </div>
        </form>
    );
  };

  // --- STEP 3: Success Screen ---
  const renderStep3 = () => (
    <div style={commonStyles.successScreen}>
        <div style={commonStyles.successIcon}>🎉</div>
        <h2 style={commonStyles.successTitle}>Congratulations!</h2>
        <p style={commonStyles.successMessage}>
            Your withdrawal request for **Rs{parseFloat(form.amount).toLocaleString()}** has been submitted successfully.
            <br />
            You should receive your amount within **24 hours**.
        </p>
        <button
            style={{...commonStyles.button, width: '70%', margin: '0 auto'}}
            onClick={() => {
                setStep(1); // Start a new withdrawal
                setForm({
                    amount: '',
                    method: 'BankTransfer',
                    bank_name: '',
                    account_owner: '',
                    bank_account: ''
                });
                setMessage({ text: '', type: '' });
            }}
        >
            Start New Withdrawal
        </button>
        <button
            style={{...commonStyles.button, width: '70%', margin: '1rem auto 0', backgroundColor: TEXT_DARK_GRAY}}
            onClick={() => navigate('/deposit-history')}
        >
            View History
        </button>
    </div>
  );


  if (authLoading) {
    // ... Loading State
    return (
        <div style={commonStyles.container}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '50px', height: '50px', border: `3px solid ${TEXT_DARK_GRAY}30`, borderTop: `3px solid ${PURPLE_PRIMARY}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ color: TEXT_GRAY, fontSize: '16px', fontWeight: '500' }}>Authenticating...</div>
            </div>
        </div>
    );
  }

  // --- Main Render ---
  return (
    <div style={commonStyles.container}>
      <style>
        {`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          body {
            margin: 0;
            background: ${DARK_BG};
          }
        `}
      </style>

      {/* Header */}
      <div style={commonStyles.header}>
        <div style={commonStyles.headerLeft}>
          <div style={commonStyles.welcomeText}>As-salamu alaykum,</div>
          <div style={commonStyles.userName}>
            {userData ? (userData.first_name || userData.username || 'User') : 'User'}
          </div>
        </div>
        <div 
          style={commonStyles.notificationBtn}
          onClick={handleLogout}
        >
          <span>🚪</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={commonStyles.mainContent}>
        <h1 style={commonStyles.pageTitle}>Withdraw Funds</h1>
        <p style={commonStyles.pageSubtitle}>Safe and quick withdrawal to your account.</p>

        {/* Step Indicator */}
        {step !== 3 && (
            <div style={commonStyles.stepContainer}>
                {/* Step 1: Method */}
                <div style={commonStyles.stepItem(step === 1, step > 1)} onClick={() => step > 1 && setStep(1)}>
                    <div style={commonStyles.stepCircle(step === 1, step > 1)}>{step > 1 ? '✅' : '1'}</div>
                    Method
                    {/* Line to Step 2 */}
                    <div style={{ ...commonStyles.stepLine, ...(step > 1 && commonStyles.stepLineActive(step > 2)) }}></div>
                </div>

                {/* Step 2: Details */}
                <div style={commonStyles.stepItem(step === 2, step > 2)}>
                    <div style={commonStyles.stepCircle(step === 2, step > 2)}>{step > 2 ? '✅' : '2'}</div>
                    Details
                </div>
            </div>
        )}


        {/* Form Card / Step Content */}
        <div style={step === 3 ? {} : commonStyles.formCard}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={commonStyles.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'invest', icon: '💼', label: 'Invest' },
          { id: 'deposit', icon: '💰', label: 'Withdraw' }, 
          { id: 'history', icon: '📋', label: 'History' }
        ].map((nav) => (
          <div 
            key={nav.id}
            style={activeTab === nav.id ? commonStyles.navItemActive : commonStyles.navItem} 
            onClick={() => handleNavigation(nav.id)}
          >
            <div style={activeTab === nav.id ? commonStyles.navIconActive : commonStyles.navIcon}>
              {nav.icon}
            </div>
            <div style={activeTab === nav.id ? commonStyles.navLabelActive : commonStyles.navLabel}>
              {nav.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WithdrawPage;
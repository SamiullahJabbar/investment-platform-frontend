import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL, { removeTokens } from '../api/baseURL';

// --- JWT DECODE FUNCTION (Remains the same) ---
const decodeJwt = (token) => {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        let base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64Url.length % 4) {
            base64Url += '=';
        }

        const jsonPayload = atob(base64Url);
        const fixedPayload = decodeURIComponent(jsonPayload.split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(fixedPayload);
    } catch (e) {
        console.error("JWT Decode Error:", e);
        return null;
    }
};

function DepositPage() {
  const navigate = useNavigate();
  const [displayUserName, setDisplayUserName] = useState('User');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --- UPDATED STEP STATE: Now 1, 2, 3, or 4 (Success) ---
  const [step, setStep] = useState(1);

  // --- UPDATED FORM DATA STATE ---
  const [formData, setFormData] = useState({
    amount: '',
    method: '', // JazzCash, Easypaisa, BankTransfer

    // Step 3 API fields
    transaction_id: '',
    bank_name: '',
    account_owner: '',
    screenshot: null
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [activeTab, setActiveTab] = useState('Deposit'); // Deposit is active tab
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredFile, setHoveredFile] = useState(false);

  // Constants
  const MIN_AMOUNT = 3000;
  const AMOUNT_OPTIONS = [3000, 5000, 10000];
  const METHOD_OPTIONS = ['JazzCash', 'Easypaisa', 'BankTransfer'];

  // Fixed Bank Details (Used for Step 2)
  const FIXED_BANK_DETAILS = {
    JazzCash: { icon: '📱', name: 'JazzCash', number: '0300-1234567', detail: 'Send to Phone Number' },
    Easypaisa: { icon: '📱', name: 'EasyPaisa', number: '0312-7654321', detail: 'Send to Phone Number' },
    BankTransfer: { icon: '🏛️', name: 'Bank Transfer', number: '1234-5678-9012-3456', detail: 'HBL Bank' }
  };
  const FIXED_ACCOUNT_OWNER = 'Tesing Acount ';


  // --- AUTH AND RESIZE EFFECTS (Unchanged) ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const checkAuthAndSetUser = () => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const decoded = decodeJwt(token);

      if (decoded) {
        const userName = decoded.username || decoded.name || decoded.user;
        if (userName) {
            setDisplayUserName(userName.toUpperCase());
        } else {
            setDisplayUserName('INVESTOR');
        }
      } else {
        console.warn('Token decoding failed. Redirecting to login.');
        removeTokens();
        navigate('/login');
      }

      setAuthLoading(false);
    };

    checkAuthAndSetUser();
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // --- HANDLERS (Unchanged) ---
  const isMobile = windowWidth <= 768;

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const handleAmountSelect = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount }));
    setError('');
  };

  const handleMethodSelect = (method) => {
    setFormData(prev => ({ ...prev, method: method }));
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setFormData(prev => ({ ...prev, screenshot: file }));
      const reader = new FileReader();
      reader.onload = (e) => { setPreviewImage(e.target.result); };
      reader.readAsDataURL(file);
    }
  };

  // --- NAVIGATION HANDLERS (Unchanged) ---
  const handleNext = () => {
    setMessage('');
    setError('');

    if (step === 1) {
      const amount = parseFloat(formData.amount);
      if (!amount || amount < MIN_AMOUNT) {
        setError(`Amount must be at least ${MIN_AMOUNT} PKR.`);
        return;
      }
      setStep(2);

    } else if (step === 2) {
      if (!formData.method) {
        setError('Please select a payment method.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setMessage('');
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };
  
  const handleGoHome = () => {
      navigate('/'); 
  }

  // --- API SUBMISSION (Step 3) (Unchanged) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!formData.transaction_id || !formData.bank_name || !formData.account_owner || !formData.screenshot) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Session expired. Please login again.');
        removeTokens();
        navigate('/login');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('amount', formData.amount);
      submitData.append('method', formData.method);
      submitData.append('transaction_id', formData.transaction_id);
      submitData.append('bank_name', formData.bank_name);
      submitData.append('account_owner', formData.account_owner);
      submitData.append('screenshot', formData.screenshot);

      await axios.post(
        `${BASE_URL}/transactions/deposit/`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setStep(4);
      setMessage('Your deposit request is successfully submitted.');
      
      setFormData(prev => ({
        ...prev,
        transaction_id: '',
        bank_name: '',
        account_owner: '',
        screenshot: null
      }));
      setPreviewImage('');
      
    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
          removeTokens();
          navigate('/login');
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.transaction_id) {
          setError('This transaction ID already exists or is invalid.');
        } else if (errorData.bank_name || errorData.account_owner || errorData.amount) {
            setError('Please check all fields. Some input is invalid.');
        } else {
          setError('API failed. Please check your data.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    removeTokens();
    navigate('/login');
  };

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'invest') {
      navigate('/invest');
    } else if (tab === 'profile') {
      navigate('/');
    }
  };
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard! ✅');
    setTimeout(() => setMessage(''), 2000);
  };


  // --- COLOR CONSTANTS (Unchanged) ---
  const PURPLE_PRIMARY = '#8B5CF6';
  const PURPLE_DARK = '#7C3AED';
  const PURPLE_LIGHT = '#A78BFA';
  const DARK_BG = '#0F0F23';
  const FORM_CARD_BG = '#1A1B2F';
  const INPUT_BG = '#252641';
  const INPUT_BG_FILLED = '#2D2E52';
  const TEXT_LIGHT = '#F8FAFC';
  const TEXT_GRAY = '#94A3B8';
  const TEXT_DARK_GRAY = '#64748B';
  const SUCCESS_GREEN = '#10B981';
  const ERROR_RED = '#EF4444';
  
  // Define header height for fixed positioning adjustments
  const HEADER_HEIGHT = '70px'; // Approx. height of the header
  const BOTTOM_NAV_HEIGHT = '85px'; // Height of the bottom navigation

  // --- STYLES (UPDATED FOR FIXED HEADER AND PROPER SCROLLING) ---
  const styles = {
    container: {
      minHeight: '100vh',
      background: DARK_BG,
      color: TEXT_LIGHT,
      fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
      position: 'relative',
      // No paddingBottom here; leave scrolling to body/main area
    },

    header: {
      // FIX 1: Make header fixed so it stays on top
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT, // Explicit height for alignment
      padding: '12px 16px', // Adjusted padding for fixed height
      background: 'rgba(26, 27, 47, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${TEXT_DARK_GRAY}30`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1010, // Higher Z-index than bottomNav
      animation: 'slideDown 0.6s ease-out',
      boxSizing: 'border-box'
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
      // FIX 2: Add padding-top to compensate for the fixed header
      paddingTop: HEADER_HEIGHT,
      // FIX 3: Add padding-bottom to compensate for the fixed bottom navigation
      paddingBottom: BOTTOM_NAV_HEIGHT,
      paddingLeft: isMobile ? '1rem' : '2rem',
      paddingRight: isMobile ? '1rem' : '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      // Ensure content starts below header and doesn't get covered by bottom nav
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
      backgroundClip: 'text',
      marginTop: '2rem' // Give space at the top of main content
    },

    pageSubtitle: {
      fontSize: '1rem',
      color: TEXT_GRAY,
      textAlign: 'center',
      marginBottom: '2.5rem',
      fontWeight: '400'
    },

    // --- STEP INDICATOR STYLES (Unchanged) ---
    stepIndicator: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        padding: '0 1rem',
        maxWidth: '450px',
        margin: '0 auto 2rem',
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        opacity: 0.5,
        transition: 'opacity 0.3s ease'
    },
    stepItemActive: {
        opacity: 1,
    },
    stepNumber: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: TEXT_DARK_GRAY,
        color: DARK_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
        marginBottom: '4px',
        transition: 'background 0.3s ease',
    },
    stepNumberActive: {
        background: PURPLE_PRIMARY,
        color: TEXT_LIGHT,
        boxShadow: `0 0 0 4px ${PURPLE_PRIMARY}30`
    },
    stepLine: {
        height: '2px',
        background: TEXT_DARK_GRAY,
        flex: 1,
        margin: '0 8px',
        alignSelf: 'center',
        transition: 'background 0.3s ease'
    },
    stepLineCompleted: {
        background: SUCCESS_GREEN
    },
    stepLabel: {
        fontSize: '11px', 
        color: TEXT_GRAY,
        marginTop: '0.5rem',
        fontWeight: '500'
    },
    // --- END STEP INDICATOR STYLES ---

    // Deposit Form Section (Unchanged)
    depositFormSection: {
      background: FORM_CARD_BG,
      borderRadius: '20px',
      padding: '2rem',
      border: `1px solid ${TEXT_DARK_GRAY}30`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.6s ease-out'
    },
    
    // --- SUCCESS SCREEN STYLE (Step 4) (Unchanged) ---
    successCard: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: `2px solid ${SUCCESS_GREEN}50`,
      borderRadius: '20px',
      padding: '3rem 2rem',
      textAlign: 'center',
      marginTop: '2rem',
      animation: 'fadeIn 0.8s ease-out',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem'
    },
    successIcon: {
        fontSize: '4rem',
        color: SUCCESS_GREEN,
        animation: 'bounce 1s infinite alternate'
    },
    successTitle: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: SUCCESS_GREEN
    },
    successText: {
        fontSize: '1.1rem',
        color: TEXT_LIGHT,
        lineHeight: '1.6',
        maxWidth: '450px',
        margin: '0 auto'
    },
    // --- END SUCCESS SCREEN STYLE ---


    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: TEXT_LIGHT,
      marginBottom: '1.5rem',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },

    // Amount Grid & Input (Unchanged)
    amountGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    amountButton: {
      background: INPUT_BG,
      color: TEXT_LIGHT,
      border: `2px solid ${INPUT_BG}`,
      padding: '1.2rem 0.5rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    amountButtonActive: {
      background: 'rgba(139, 92, 246, 0.2)',
      borderColor: PURPLE_PRIMARY,
      boxShadow: `0 0 0 4px ${PURPLE_PRIMARY}20`
    },
    otherAmountInput: {
      padding: '1rem 1.2rem',
      borderRadius: '12px',
      fontSize: '0.95rem',
      background: INPUT_BG,
      color: TEXT_LIGHT,
      border: `2px solid ${INPUT_BG}`,
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      marginTop: '0.5rem'
    },

    // Method Dropdown & Card (Unchanged)
    methodDropdown: {
        padding: '1rem 1.2rem',
        borderRadius: '12px',
        fontSize: '0.95rem',
        background: INPUT_BG,
        color: TEXT_LIGHT,
        border: `2px solid ${INPUT_BG}`,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
    },
    bankMethodCard: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: `1px solid ${PURPLE_PRIMARY}30`,
        borderRadius: '16px',
        padding: '1.5rem',
        textAlign: 'center',
        marginTop: '1.5rem',
    },
    methodIcon: { fontSize: '2.5rem', marginBottom: '0.5rem' },
    methodName: { fontSize: '1.4rem', fontWeight: '700', color: PURPLE_LIGHT, marginBottom: '0.5rem' },
    methodDetail: { fontSize: '1rem', color: TEXT_GRAY, marginBottom: '0.75rem', fontWeight: '500' },
    methodNumber: {
        fontSize: '1.1rem',
        color: TEXT_LIGHT,
        fontWeight: '700',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '0.75rem',
        borderRadius: '10px',
        marginTop: '1rem',
        wordBreak: 'break-word',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountOwner: {
        background: 'rgba(16, 185, 129, 0.1)',
        border: `1px solid ${SUCCESS_GREEN}30`,
        borderRadius: '12px',
        padding: '0.75rem',
        marginTop: '1rem'
    },
    ownerText: { color: SUCCESS_GREEN, fontWeight: '600', fontSize: '0.9rem' },
    copyBtn: {
        background: 'rgba(255, 255, 255, 0.15)',
        border: 'none',
        color: TEXT_LIGHT,
        fontSize: '14px',
        padding: '6px 10px',
        borderRadius: '8px',
        marginLeft: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
    },

    // Form Fields (Step 3) (Unchanged)
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { color: TEXT_LIGHT, fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' },
    input: {
      padding: '1rem 1.2rem',
      borderRadius: '12px',
      fontSize: '0.95rem',
      background: INPUT_BG,
      color: TEXT_LIGHT,
      border: `2px solid ${INPUT_BG}`,
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },
    inputFocus: { borderColor: PURPLE_PRIMARY, background: INPUT_BG_FILLED, boxShadow: `0 0 0 3px ${PURPLE_PRIMARY}20` },
    fileInput: { display: 'none' },
    fileLabel: {
      padding: '1rem 1.2rem',
      borderRadius: '12px',
      background: INPUT_BG,
      color: TEXT_GRAY,
      border: `2px dashed ${TEXT_DARK_GRAY}50`,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    fileLabelHover: { borderColor: PURPLE_PRIMARY, color: PURPLE_LIGHT, background: INPUT_BG_FILLED },
    previewContainer: { marginTop: '1rem', textAlign: 'center' },
    previewImage: { maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', border: `2px solid ${TEXT_DARK_GRAY}30` },

    // Notes (Unchanged)
    note: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: `1px solid rgba(245, 158, 11, 0.3)`,
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1.5rem 0'
    },
    noteTitle: {
      color: '#F59E0B',
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    noteText: {
      color: TEXT_GRAY,
      fontSize: '0.9rem',
      lineHeight: '1.5'
    },

    // Buttons (Unchanged)
    actionBtn: {
      background: `linear-gradient(135deg, ${PURPLE_PRIMARY} 0%, ${PURPLE_DARK} 100%)`,
      color: 'white',
      border: 'none',
      padding: '1.2rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      flex: 1,
    },
    actionBtnHover: {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${PURPLE_DARK}60`
    },
    actionBtnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    backBtn: {
        background: INPUT_BG,
        color: TEXT_GRAY,
        border: `1px solid ${TEXT_DARK_GRAY}`,
        padding: '1.2rem 2rem',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: isMobile ? '100%' : 'auto',
        flex: 1,
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1.5rem', 
        flexDirection: isMobile ? 'column' : 'row'
    },

    // Messages (Unchanged)
    message: {
      padding: '1rem',
      borderRadius: '12px',
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    errorMessage: {
      background: 'rgba(239, 68, 68, 0.2)',
      color: ERROR_RED,
      border: `1px solid ${ERROR_RED}50`
    },
    successMessage: {
      background: 'rgba(16, 185, 129, 0.2)',
      color: SUCCESS_GREEN,
      border: `1px solid ${SUCCESS_GREEN}50`
    },

    // Loading State (Unchanged)
    loadingContainer: {
      minHeight: '100vh',
      background: DARK_BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px'
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: `3px solid ${TEXT_DARK_GRAY}30`,
      borderTop: `3px solid ${PURPLE_PRIMARY}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
     // Bottom Navigation (Unchanged, but Z-index ensured)
    bottomNav: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: BOTTOM_NAV_HEIGHT,
      background: 'rgba(26, 27, 47, 0.95)',
      backdropFilter: 'blur(25px)',
      borderTop: `1px solid ${TEXT_DARK_GRAY}30`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '12px 0',
      boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.3)',
      zIndex: 1000 // Lower Z-index than header
    },

    navItem: {
      textAlign: 'center',
      cursor: 'pointer',
      padding: '12px 14px',
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flex: 1,
      margin: '0 4px',
      maxWidth: isMobile ? '70px' : '100px',
    },

    navItemActive: {
      background: 'rgba(139, 92, 246, 0.2)',
      border: `1px solid ${PURPLE_PRIMARY}40`,
      transform: 'translateY(-6px)'
    },

    navIcon: {
      fontSize: '24px',
      marginBottom: '6px',
      transition: 'all 0.3s ease',
      color: TEXT_GRAY,
    },

    navIconActive: {
      transform: 'scale(1.15)',
      color: PURPLE_PRIMARY,
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
  };

  // --- INLINE KEYFRAMES (Unchanged) ---
  const keyframesStyle = `
    @keyframes slideDown {
      from { transform: translateY(-30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    body {
        margin: 0;
        background: ${DARK_BG};
    }
  `;

  // --- RENDER FUNCTIONS (Unchanged logic, relying on updated styles) ---
  const renderStep1 = () => (
    <div style={styles.depositFormSection}>
        <div style={styles.sectionTitle}>
            <span>💵</span> Select Your Amount
        </div>
        
        {/* ... (Amount Selection HTML) ... */}
        <div style={styles.amountGrid}>
            {AMOUNT_OPTIONS.map(amount => (
                <div
                    key={amount}
                    onClick={() => handleAmountSelect(amount.toString())}
                    style={{
                        ...styles.amountButton,
                        ...(formData.amount === amount.toString() && styles.amountButtonActive)
                    }}
                >
                    {amount.toLocaleString('en-US')} PKR
                </div>
            ))}
            <div
                onClick={() => handleAmountSelect('')}
                style={{
                    ...styles.amountButton,
                    ...(formData.amount !== '' && !AMOUNT_OPTIONS.includes(Number(formData.amount)) && styles.amountButtonActive)
                }}
            >
                Other
            </div>
        </div>

        {(!AMOUNT_OPTIONS.includes(Number(formData.amount))) && (
            <div style={styles.formGroup}>
                <label style={styles.label}>Enter Custom Amount (Min {MIN_AMOUNT} PKR)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange({target: {name: 'amount', value: e.target.value}})}
                    style={{...styles.otherAmountInput, ...(focusedField === 'amount' && styles.inputFocus)}}
                    placeholder={`Enter amount (Min ${MIN_AMOUNT})`}
                    onFocus={() => handleFocus('amount')}
                    onBlur={handleBlur}
                    min={MIN_AMOUNT}
                    step="1"
                />
            </div>
        )}

        <div style={styles.buttonGroup}>
            <button
                type="button"
                onClick={handleNext}
                style={{
                    ...styles.actionBtn,
                    ...((loading || !formData.amount || (parseFloat(formData.amount) < MIN_AMOUNT)) && styles.actionBtnDisabled)
                }}
                disabled={loading || !formData.amount || (parseFloat(formData.amount) < MIN_AMOUNT)}
            >
                Next
            </button>
        </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedDetails = FIXED_BANK_DETAILS[formData.method] || null;

    return (
      <div style={styles.depositFormSection}>
        <div style={styles.sectionTitle}>
            <span>💳</span> Select Payment Method & Pay
        </div>

        {/* Payment Method Dropdown */}
        <div style={styles.formGroup}>
            <label style={styles.label}>Select Payment Method</label>
            <select
                name="method"
                value={formData.method}
                onChange={(e) => handleMethodSelect(e.target.value)}
                style={styles.methodDropdown}
            >
                <option value="">Choose Method</option>
                {METHOD_OPTIONS.map(method => (
                    <option key={method} value={method}>{method}</option>
                ))}
            </select>
        </div>

        {/* Method Details Card */}
        {selectedDetails && (
            <div style={styles.bankMethodCard}>
                <div style={styles.methodIcon}>{selectedDetails.icon}</div>
                <div style={styles.methodName}>{selectedDetails.name}</div>
                <div style={styles.methodDetail}>{selectedDetails.detail}</div>
                <div style={styles.methodNumber}>
                    {selectedDetails.number}
                    <button
                        onClick={() => handleCopy(selectedDetails.number)}
                        style={styles.copyBtn}
                    >
                        <span role="img" aria-label="copy">📋</span> Copy
                    </button>
                </div>
                <div style={styles.accountOwner}>
                    <div style={styles.ownerText}>
                        Account Owner: **{FIXED_ACCOUNT_OWNER}**
                    </div>
                </div>
                <div style={styles.note}>
                    <div style={styles.noteTitle}>⚠️ Action Required: Pay Now</div>
                    <div style={styles.noteText}>
                        Please **pay the amount** of **{parseFloat(formData.amount).toLocaleString('en-US')} PKR** to the details above *before* proceeding.
                        You must save the **Transaction ID** and **Screenshot**.
                    </div>
                </div>
            </div>
        )}

        {/* Button Group */}
        <div style={styles.buttonGroup}>
            <button type="button" onClick={handleBack} style={styles.backBtn}>
                Back
            </button>
            <button
                type="button"
                onClick={handleNext}
                style={{
                    ...styles.actionBtn,
                    ...((loading || !formData.method) && styles.actionBtnDisabled)
                }}
                disabled={loading || !formData.method}
            >
                Next (Enter Proof)
            </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div style={styles.depositFormSection}>
        <div style={styles.sectionTitle}>
            <span>🧾</span> Finalize Details
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
            {/* ... (Summary and Form fields HTML) ... */}
            <div style={styles.note}>
                <div style={styles.noteTitle}> Deposit Summary</div>
                <div style={styles.noteText}>
                    **Amount:** <span style={{color: PURPLE_LIGHT, fontWeight: '700'}}>{parseFloat(formData.amount).toLocaleString('en-US')} PKR</span>
                    <br/>
                    **Method:** <span style={{color: PURPLE_LIGHT, fontWeight: '700'}}>{formData.method}</span>
                </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Transaction ID / Reference Number *</label>
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleInputChange}
                style={{...styles.input, ...(focusedField === 'transaction_id' && styles.inputFocus)}}
                placeholder="e.g., TPIN123456789"
                onFocus={() => handleFocus('transaction_id')}
                onBlur={handleBlur}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Your Sending Bank/Method Name *</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                style={{...styles.input, ...(focusedField === 'bank_name' && styles.inputFocus)}}
                placeholder="e.g., UBL, Meezan Bank, Personal JazzCash"
                onFocus={() => handleFocus('bank_name')}
                onBlur={handleBlur}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Your Account Owner Name (Sender Name) *</label>
              <input
                type="text"
                name="account_owner"
                value={formData.account_owner}
                onChange={handleInputChange}
                style={{...styles.input, ...(focusedField === 'account_owner' && styles.inputFocus)}}
                placeholder="Your Full Name on the account"
                onFocus={() => handleFocus('account_owner')}
                onBlur={handleBlur}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Transaction Screenshot (Proof of Payment) *</label>
              <input
                type="file"
                id="screenshot"
                onChange={handleFileChange}
                accept="image/*"
                style={styles.fileInput}
                required={!formData.screenshot}
              />
              <label
                htmlFor="screenshot"
                style={{
                    ...styles.fileLabel,
                    ...(hoveredFile && styles.fileLabelHover),
                    ...(formData.screenshot && { borderColor: SUCCESS_GREEN, color: SUCCESS_GREEN })
                }}
                onMouseEnter={() => setHoveredFile(true)}
                onMouseLeave={() => setHoveredFile(false)}
              >
                {formData.screenshot ? `File Selected: ${formData.screenshot.name}` : 'Upload Screenshot (Max 5MB)'}
              </label>

              {previewImage && (
                <div style={styles.previewContainer}>
                  <img src={previewImage} alt="Preview" style={styles.previewImage}/>
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
                <button type="button" onClick={handleBack} style={styles.backBtn} disabled={loading}>
                    Back
                </button>
                <button
                  type="submit"
                  style={{...styles.actionBtn, ...(loading && styles.actionBtnDisabled)}}
                  disabled={loading || !formData.transaction_id || !formData.screenshot}
                >
                  {loading ? 'Submitting Request...' : 'Submit Deposit Request'}
                </button>
            </div>
        </form>
    </div>
  );
  
  const renderStep4 = () => (
      <div style={styles.depositFormSection}>
          <div style={styles.successCard}>
              <div style={styles.successIcon}>🎉</div>
              <h3 style={styles.successTitle}>Deposit Submitted Successfully!</h3>
              <p style={styles.successText}>
                  **Thank you for depositing!** Your payment of **PKR {parseFloat(formData.amount).toLocaleString()}** has been successfully recorded. Your amount will be added to your balance soon after verification by our team.
              </p>
              
              <button
                  onClick={handleGoHome}
                  style={{
                    ...styles.actionBtn,
                    width: isMobile ? '100%' : '60%',
                    marginTop: '0' 
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = styles.actionBtnHover.boxShadow}
                  onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                  Go Home
              </button>
          </div>
      </div>
  );

  const renderStepIndicator = () => {
    const stepsArray = [1, 2, 3];
    return (
      <div style={styles.stepIndicator}>
          {stepsArray.map((s) => (
              <React.Fragment key={s}>
                  <div style={{...styles.stepItem, ...(s <= step && styles.stepItemActive)}}>
                      <div style={{
                          ...styles.stepNumber,
                          ...(s <= step || step === 4 ? styles.stepNumberActive : {})
                      }}>
                          {s}
                      </div>
                      <div style={styles.stepLabel}>
                          {s === 1 ? 'Amount' : s === 2 ? 'Method' : 'Submit'}
                      </div>
                  </div>
                  {s < 3 && <div style={{...styles.stepLine, ...(s < step || step === 4 ? styles.stepLineCompleted : {})}}></div>}
              </React.Fragment>
          ))}
      </div>
    );
  };

  // --- MAIN RENDER LOGIC (Unchanged) ---
  if (authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={{color: TEXT_GRAY, fontSize: '16px', fontWeight: '500'}}>
          Loading...
        </div>
      </div>
    );
  }

  let content;
  let subtitle;

  if (step === 4) {
      content = renderStep4();
      subtitle = 'Your request is complete!';
  } else {
      switch (step) {
          case 1:
            content = renderStep1();
            subtitle = 'How much do you want to invest?';
            break;
          case 2:
            content = renderStep2();
            subtitle = `Complete your payment of PKR ${parseFloat(formData.amount).toLocaleString()}.`;
            break;
          case 3:
            content = renderStep3();
            subtitle = 'Submit the transfer proof to finalize your deposit.';
            break;
          default:
            content = renderStep1();
            subtitle = 'How much do you want to invest?';
      }
  }


  // --- FINAL RETURN ---
  return (
    // Note: The main container only sets the background/font, scrolling is handled by the browser's viewport.
    <div style={styles.container}>
      <style>{keyframesStyle}</style>

      {/* Header (Now fixed) */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <p style={styles.welcomeText}>As-salamu alaykum,</p>
          <h1 style={styles.userName}>{displayUserName}</h1>
        </div>
        <div style={styles.notificationBtn} onClick={handleLogout} title="Logout">
          <span style={{fontSize: '20px'}}>🚪</span>
        </div>
      </header>

      {/* Main Content (Padded to account for fixed header and footer) */}
      <main style={styles.mainContent}>
        <h2 style={styles.pageTitle}>New Deposit Request</h2>
        <p style={styles.pageSubtitle}>{subtitle}</p>

        {step !== 4 && renderStepIndicator()}

        {error && <div style={{ ...styles.message, ...styles.errorMessage }}>{error}</div>}
        {message && !error && step !== 4 && <div style={{ ...styles.message, ...styles.successMessage }}>{message}</div>}

        {content}

      </main>

      {/* Bottom Navigation (Fixed) */}
      <div style={styles.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'invest', icon: '💼', label: 'Invest' },
          { id: 'Deposit', icon: '💰', label: 'Deposit' },
          { id: 'profile', icon: '👤', label: 'Profile' }
        ].map((nav) => (
          <div
            key={nav.id}
            style={activeTab === nav.id ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
            onClick={() => handleNavigation(nav.id)}
          >
            <div style={activeTab === nav.id ? styles.navIconActive : styles.navIcon}>
              {nav.icon}
            </div>
            <div style={activeTab === nav.id ? styles.navLabelActive : styles.navLabel}>
              {nav.label}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default DepositPage;
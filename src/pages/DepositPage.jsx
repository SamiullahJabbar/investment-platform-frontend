import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Assuming removeTokens is available in baseURL.js
import BASE_URL, { removeTokens } from '../api/baseURL'; 

const decodeJwt = (token) => {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        let base64Url = parts[1];

        // 1. Base64Url to Base64 (replace - with +, _ with /)
        base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // 2. Add padding '=' to make it valid Base64 string if necessary
        // Base64 strings must be a multiple of 4 in length.
        while (base64Url.length % 4) {
            base64Url += '=';
        }
        
        // 3. Decode the Base64 string
        const jsonPayload = atob(base64Url);
        
        // 4. Decode URI components to handle Unicode characters (if any)
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
  // State for username
  const [displayUserName, setDisplayUserName] = useState('User'); 
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    custom_method: '',
    transaction_id: '',
    screenshot: null
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Real-time responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Check authentication and extract username from token (No API call needed)
    const checkAuthAndSetUser = () => {
      const token = sessionStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Decode JWT to get user details
      const decoded = decodeJwt(token);
      
      if (decoded) {
        // --- UPDATED USERNAME EXTRACTION LOGIC ---
        // ONLY look for keys that hold the user's name: 'username', 'name', or 'user'.
        const userName = decoded.username || decoded.name || decoded.user;
        
        // If a valid username is found (not null, undefined, or empty string), use it.
        if (userName) {
            setDisplayUserName(userName.toUpperCase()); 
        } else {
            // Fallback to a generic investor title if no specific name key exists.
            // Email is intentionally ignored as per your request.
            setDisplayUserName('INVESTOR');
            console.warn("JWT decoded, but 'username', 'name', or 'user' key was not found in the payload.");
        }
        
      } else {
        // If decoding fails, token might be corrupt
        console.warn('Token decoding failed. Redirecting to login.');
        removeTokens();
        navigate('/login');
      }

      setAuthLoading(false);
    };

    checkAuthAndSetUser();
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]); 

  // --- REST OF THE CODE REMAINS UNCHANGED ---
  const isMobile = windowWidth <= 768;

  // Fixed Bank Details (Same as before)
  const fixedBankDetails = {
    accountName: "Investment Accounting",
    jazzcash: "0300-1234567",
    easypaisa: "0312-7654321", 
    bankAccount: "1234-5678-9012-3456",
    bankName: "HBL Bank"
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      setFormData(prev => ({
        ...prev,
        screenshot: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!formData.amount || !formData.method || !formData.transaction_id || !formData.screenshot) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    if (formData.method === 'other' && !formData.custom_method) {
      setError('Please specify payment method');
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
      submitData.append('method', formData.method === 'other' ? formData.custom_method : formData.method);
      submitData.append('transaction_id', formData.transaction_id);
      submitData.append('screenshot', formData.screenshot);
      
      // Deposit API Call (Integrated as requested)
      const response = await axios.post(
        `${BASE_URL}/transactions/deposit/`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.message) {
        setMessage('Your deposit request is successfully submitted. Amount will be added soon.');
        setFormData({
          amount: '',
          method: '',
          custom_method: '',
          transaction_id: '',
          screenshot: null
        });
        setPreviewImage('');
      }

    } catch (err) {
      // Check for 401 Unauthorized errors to handle expired tokens
      if (err.response && err.response.status === 401) {
        setError('Session expired. Please login again.');
        removeTokens();
        navigate('/login');
      } else if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.response && err.response.data.transaction_id) {
        setError('This transaction ID already exists or is invalid.');
      } else {
        setError('Network error or API failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeTokens(); 
    navigate('/login');
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

  // --- STYLES (Unchanged for visual consistency) ---
  const styles = {
    container: {
      minHeight: '100vh',
      background: DARK_BG,
      color: TEXT_LIGHT,
      fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
      position: 'relative',
      paddingBottom: '90px'
    },

    // Header (Same as Dashboard)
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

    // Main Content
    mainContent: {
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      maxWidth: '800px',
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

    // Fixed Bank Details Section
    bankDetailsSection: {
      background: FORM_CARD_BG,
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      border: `1px solid ${TEXT_DARK_GRAY}30`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.6s ease-out 0.2s both'
    },

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

    bankMethodsGrid: {
      display: 'grid',
      // Ensured full mobile responsiveness: 1 column on mobile, 3 on desktop
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
      gap: '1rem',
      marginBottom: '1.5rem'
    },

    bankMethodCard: {
      background: 'rgba(139, 92, 246, 0.1)',
      border: `1px solid ${PURPLE_PRIMARY}30`,
      borderRadius: '16px',
      padding: '1.5rem',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },

    methodIcon: {
      fontSize: '2rem',
      marginBottom: '1rem'
    },

    methodName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: PURPLE_LIGHT,
      marginBottom: '0.5rem'
    },

    methodDetail: {
      fontSize: '0.9rem',
      color: TEXT_LIGHT,
      marginBottom: '0.25rem',
      fontWeight: '500'
    },

    methodNumber: {
      fontSize: '1rem',
      color: TEXT_LIGHT,
      fontWeight: '700',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '0.5rem',
      borderRadius: '8px',
      marginTop: '0.5rem',
      // Added word-break for long account numbers on mobile
      wordBreak: 'break-word' 
    },

    accountOwner: {
      textAlign: 'center',
      background: 'rgba(16, 185, 129, 0.1)',
      border: `1px solid ${SUCCESS_GREEN}30`,
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem'
    },

    ownerText: {
      color: SUCCESS_GREEN,
      fontWeight: '600',
      fontSize: '0.95rem'
    },

    // Deposit Form Section
    depositFormSection: {
      background: FORM_CARD_BG,
      borderRadius: '20px',
      padding: '2rem',
      border: `1px solid ${TEXT_DARK_GRAY}30`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.6s ease-out 0.4s both'
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },

    label: {
      color: TEXT_LIGHT,
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '0.25rem'
    },

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

    inputFocus: {
      borderColor: PURPLE_PRIMARY,
      background: INPUT_BG_FILLED,
      boxShadow: `0 0 0 3px ${PURPLE_PRIMARY}20`
    },

    select: {
      padding: '1rem 1.2rem',
      borderRadius: '12px',
      fontSize: '0.95rem',
      background: INPUT_BG,
      color: TEXT_LIGHT,
      border: `2px solid ${INPUT_BG}`,
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      cursor: 'pointer'
    },

    fileInput: {
      display: 'none'
    },

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

    fileLabelHover: {
      borderColor: PURPLE_PRIMARY,
      color: PURPLE_LIGHT,
      background: INPUT_BG_FILLED
    },

    previewContainer: {
      marginTop: '1rem',
      textAlign: 'center'
    },

    previewImage: {
      maxWidth: '100%',
      maxHeight: '200px',
      borderRadius: '12px',
      border: `2px solid ${TEXT_DARK_GRAY}30`
    },

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

    submitBtn: {
      background: `linear-gradient(135deg, ${PURPLE_PRIMARY} 0%, ${PURPLE_DARK} 100%)`,
      color: 'white',
      border: 'none',
      padding: '1.2rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '1rem',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    },

    submitBtnHover: {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${PURPLE_PRIMARY}40`
    },

    submitBtnLoading: {
      opacity: '0.7',
      cursor: 'not-allowed',
      transform: 'none'
    },

    message: {
      padding: '1rem',
      borderRadius: '12px',
      textAlign: 'center',
      fontWeight: '600',
      marginTop: '1rem',
      animation: 'slideDown 0.3s ease'
    },

    successMsg: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: SUCCESS_GREEN,
      border: `1px solid ${SUCCESS_GREEN}30`
    },

    errorMsg: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: ERROR_RED,
      border: `1px solid ${ERROR_RED}30`
    },

    // Bottom Navigation (Mobile Responsive)
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
      margin: '0 4px', // Reduced margin for mobile
      maxWidth: isMobile ? '70px' : '100px', // Better spacing on small screens
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

    // Loading State
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
    }
  };

  const [focusedField, setFocusedField] = useState(null);
  const [hoveredFile, setHoveredFile] = useState(false);

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  // Navigation handler
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/dashboard');
    } else if (tab === 'invest') {
      navigate('/invest');
    } else if (tab === 'team') {
      navigate('/team');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };

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

  return (
    <div style={styles.container}>
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

      {/* Header (Username from Token) */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.welcomeText}>As-salamu alaykum,</div>
          <div style={styles.userName}>
            {displayUserName}
          </div>
        </div>
        <div 
          style={styles.notificationBtn}
          onClick={handleLogout}
        >
          <span>🚪</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.pageTitle}>Deposit Funds</h1>
        <p style={styles.pageSubtitle}>Add money to your investment account</p>

        {/* Fixed Bank Details Section */}
        <div style={styles.bankDetailsSection}>
          <div style={styles.sectionTitle}>
            <span>🏦</span> Bank & Payment Details
          </div>
          
          <div style={styles.bankMethodsGrid}>
            {/* JazzCash */}
            <div style={styles.bankMethodCard}>
              <div style={styles.methodIcon}>📱</div>
              <div style={styles.methodName}>JazzCash</div>
              <div style={styles.methodDetail}>Send to Phone Number</div>
              <div style={styles.methodNumber}>{fixedBankDetails.jazzcash}</div>
            </div>

            {/* EasyPaisa */}
            <div style={styles.bankMethodCard}>
              <div style={styles.methodIcon}>📱</div>
              <div style={styles.methodName}>EasyPaisa</div>
              <div style={styles.methodDetail}>Send to Phone Number</div>
              <div style={styles.methodNumber}>{fixedBankDetails.easypaisa}</div>
            </div>

            {/* Bank Transfer */}
            <div style={styles.bankMethodCard}>
              <div style={styles.methodIcon}>🏛️</div>
              <div style={styles.methodName}>Bank Transfer</div>
              <div style={styles.methodDetail}>{fixedBankDetails.bankName}</div>
              <div style={styles.methodNumber}>{fixedBankDetails.bankAccount}</div>
            </div>
          </div>

          <div style={styles.accountOwner}>
            <div style={styles.ownerText}>
              Account Owner: {fixedBankDetails.accountName}
            </div>
          </div>
        </div>

        {/* Deposit Form Section */}
        <div style={styles.depositFormSection}>
          <div style={styles.sectionTitle}>
            <span>💰</span> Submit Deposit Request
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Amount Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount (PKR)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(focusedField === 'amount' && styles.inputFocus)
                }}
                placeholder="Enter amount in PKR"
                onFocus={() => handleFocus('amount')}
                onBlur={handleBlur}
                min="1"
                step="1"
              />
            </div>

            {/* Payment Method */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Method Used</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  ...(focusedField === 'method' && styles.inputFocus)
                }}
                onFocus={() => handleFocus('method')}
                onBlur={handleBlur}
              >
                <option value="">Select Payment Method</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="BankTransfer">BankTransfer</option>
                {/* <option value="other">Other Method</option> */}
              </select>
            </div>

            {/* Custom Method */}
            {formData.method === 'other' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Specify Payment Method</label>
                <input
                  type="text"
                  name="custom_method"
                  value={formData.custom_method}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(focusedField === 'custom_method' && styles.inputFocus)
                  }}
                  placeholder="Enter payment method name"
                  onFocus={() => handleFocus('custom_method')}
                  onBlur={handleBlur}
                />
              </div>
            )}

            {/* Transaction ID */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Transaction ID</label>
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(focusedField === 'transaction_id' && styles.inputFocus)
                }}
                placeholder="Enter transaction ID from your payment"
                onFocus={() => handleFocus('transaction_id')}
                onBlur={handleBlur}
              />
            </div>

            {/* Screenshot Upload */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Transaction Screenshot</label>
              <input
                type="file"
                id="screenshot"
                onChange={handleFileChange}
                accept="image/*"
                style={styles.fileInput}
              />
              <label 
                htmlFor="screenshot"
                style={{
                  ...styles.fileLabel,
                  ...(hoveredFile && styles.fileLabelHover)
                }}
                onMouseEnter={() => setHoveredFile(true)}
                onMouseLeave={() => setHoveredFile(false)}
              >
                {formData.screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
              </label>
              
              {previewImage && (
                <div style={styles.previewContainer}>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={styles.previewImage}
                  />
                </div>
              )}
            </div>

            {/* Important Note */}
            <div style={styles.note}>
              <div style={styles.noteTitle}>📝 Important Note</div>
              <div style={styles.noteText}>
                Please send the amount first to one of the accounts above, then fill this form with correct transaction ID 
                and upload the screenshot. Your deposit will be verified and added to your 
                account within 24 hours.
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div style={{...styles.message, ...styles.successMsg}}>
                {message}
              </div>
            )}

            {error && (
              <div style={{...styles.message, ...styles.errorMsg}}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading && styles.submitBtnLoading)
              }}
              disabled={loading}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.submitBtnHover)}
              onMouseLeave={(e) => !loading && Object.assign(e.target.style, { 
                transform: 'translateY(0)', 
                boxShadow: 'none' 
              })}
            >
              {loading ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Navigation (Mobile Responsive) */}
      <div style={styles.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'invest', icon: '💼', label: 'Invest' },
          { id: 'Deposit', icon: '💰', label: 'Deposit' },
          { id: 'profile', icon: '👤', label: 'Profile' }
        ].map((nav) => (
          <div 
            key={nav.id}
            style={activeTab === nav.id ? styles.navItemActive : styles.navItem}
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
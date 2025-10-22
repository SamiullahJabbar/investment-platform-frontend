// src/components/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api/baseURL';
import sidebarImage from '../assets/images/sidebar.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    referral_input: ''
  });
  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Real-time responsiveness setup
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // --- Handlers (API Logic INTEGRATED) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    // Restrict OTP input to 6 digits and numbers
    const re = /^[0-9\b]+$/;
    if (value === '' || (re.test(value) && value.length <= 6)) {
        setOtpData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        ...(formData.referral_input && { referral_input: formData.referral_input })
    };

    try {
        const response = await fetch(`${BASE_URL}/accounts/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(data.message || 'Registration successful. Please verify your email.');
            setStep(2);
            setOtpData({ ...otpData, email: formData.email });
        } else {
            const errorMessage = data.error || data.message || 'Registration failed. Please check your details.';
            setError(errorMessage);
        }
    } catch (err) {
        console.error('Registration network error:', err);
        setError('Network error. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const payload = {
        email: otpData.email,
        otp: otpData.otp,
    };

    try {
        const response = await fetch(`${BASE_URL}/accounts/verify-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(data.message || 'OTP verified. Account created successfully! Redirecting to login...');
            setError(''); 
            // Redirect the user to the login page after a short delay
            setTimeout(() => {
                navigate('/login'); 
            }, 2000); 
        } else {
            const errorMessage = data.error || data.message || 'OTP verification failed.';
            setError(errorMessage);
            setMessage(''); 
        }
    } catch (err) {
        console.error('OTP verification network error:', err);
        setError('Network error during OTP verification. Please try again.');
    } finally {
        setLoading(false);
    }
  };
  
  // --- COLOR CONSTANTS (UPDATED to Dark Green Scheme) ---
  const GREEN_PRIMARY = '#0a520d';  // Your main Dark Green
  const GREEN_DARK = '#073c09';     // A darker variant for gradients/shadows
  const BG_PRIMARY = '#FFFFFF';     // White Background
  const FORM_CARD_BG = '#FFFFFF';   // White Form Card
  const INPUT_BG = '#F7F8FA';       // Very Light Grey Input Background
  const INPUT_BG_FILLED = '#EEF0F2';// Slightly Darker Grey for Filled State
  const TEXT_DARK = '#1F2937';      // Near-Black for main text
  const TEXT_GRAY = '#6B7280';      // Medium Grey for sub-text
  const ERROR_RED = '#EF4444';
  const SUCCESS_GREEN = '#10B981';

  // --- ENHANCED STYLES ---
  const styles = {
    // 1. Container 
    container: {
      minHeight: '100vh',
      width: '100vw',
      background: INPUT_BG, // Use a very light grey for the page background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '0' : '1rem',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
      position: 'relative'
    },

    // 2. Main Card 
    mainCard: {
      display: 'flex',
      width: isMobile ? '100%' : '95%',
      maxWidth: '1200px',
      height: isMobile ? '100vh' : '90vh',
      maxHeight: '800px',
      background: FORM_CARD_BG,
      borderRadius: isMobile ? '0' : '16px',
      overflow: 'hidden',
      // Updated Shadow for White Background
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)', 
      animation: 'slideUp 0.6s ease-out',
      flexDirection: isMobile ? 'column' : 'row',
    },

    // 3. Left Panel (IMAGE)
    leftPanel: {
      flex: 1.3,
      background: `linear-gradient(135deg, ${GREEN_PRIMARY} 0%, ${GREEN_DARK} 100%)`,
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    sidebarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      opacity: 0.6, // Dim the image slightly for better text readability
    },
    leftContent: {
      position: 'absolute',
      bottom: '60px',
      left: '40px',
      right: '40px',
      textAlign: 'left',
      color: 'white',
      zIndex: 3,
    },
    leftTitle: {
      fontSize: '2.2rem',
      fontWeight: '800',
      lineHeight: 1.1,
      marginBottom: '1rem',
      textShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
    },
    leftSubtitle: {
      fontSize: '0.95rem',
      opacity: 0.9,
      lineHeight: '1.5',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      // Green overlay
      background: `linear-gradient(135deg, ${GREEN_PRIMARY}50 0%, ${GREEN_DARK}70 100%)`, 
      zIndex: 2,
    },

    // NEW STYLE: Mobile Image Container
    mobileImageContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 0 0',
        marginBottom: '1.5rem',
    },
    // NEW STYLE: Mobile Circular Image
    mobileImage: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        objectFit: 'cover',
        // Green border
        border: `3px solid ${GREEN_PRIMARY}`, 
        boxShadow: `0 0 0 8px ${FORM_CARD_BG}`,
    },
    
    // 4. Right Panel - Form Section
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1.5rem' : '2.5rem',
      background: FORM_CARD_BG,
      overflowY: isMobile ? 'auto' : 'hidden',
    },
    formContainer: {
      width: '100%',
      maxWidth: '400px',
      animation: 'fadeIn 0.6s ease-out',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: TEXT_DARK, // Dark Text on White
      marginBottom: '0.5rem',
      textAlign: 'left',
    },
    loginLink: {
      color: TEXT_GRAY,
      fontSize: '0.9rem',
      marginBottom: '2rem',
      textAlign: 'left',
    },
    link: {
      color: GREEN_PRIMARY, // Green Link
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.2s ease',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      color: TEXT_DARK, // Dark Text on White
      fontSize: '0.85rem',
      fontWeight: '500',
      textAlign: 'left',
    },
    
    // 5. Input Fields
    input: {
      padding: '0.9rem 1rem',
      borderRadius: '8px',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontFamily: 'inherit',
      backgroundColor: INPUT_BG,
      color: TEXT_DARK, // Dark Text in Input
      border: `1px solid ${INPUT_BG}`,
      width: '100%',
      boxSizing: 'border-box',
    },
    inputFocused: {
      backgroundColor: INPUT_BG_FILLED,
      border: `1px solid ${GREEN_PRIMARY}`, // Green Focus Border
      boxShadow: `0 0 0 2px ${GREEN_PRIMARY}30`,
    },
    inputDisabled: {
      backgroundColor: '#E5E7EB',
      color: TEXT_GRAY,
      border: '1px solid #D1D5DB',
      cursor: 'not-allowed',
    },

    // 6. Checkbox and Button Styles
    checkboxGroup: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      margin: '0.5rem 0 1rem 0',
    },
    checkboxLabel: {
      color: TEXT_GRAY,
      fontSize: '0.85rem',
      lineHeight: '1.4',
      textAlign: 'left',
    },
    registerBtn: {
      // Dark Green Gradient Button
      background: `linear-gradient(135deg, ${GREEN_PRIMARY} 0%, ${GREEN_DARK} 100%)`, 
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '0.5rem',
      width: '100%',
      boxShadow: `0 4px 10px ${GREEN_PRIMARY}40`,
    },
    btnLoading: {
      opacity: 0.8,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },

    // 7. Message Styles
    successMsg: {
      color: SUCCESS_GREEN,
      fontSize: '0.85rem',
      padding: '0.75rem',
      borderRadius: '6px',
      backgroundColor: `${SUCCESS_GREEN}20`,
      textAlign: 'center',
    },
    errorMsg: {
      color: ERROR_RED,
      fontSize: '0.85rem',
      padding: '0.75rem',
      borderRadius: '6px',
      backgroundColor: `${ERROR_RED}20`,
      textAlign: 'center',
    },

    // 8. OTP Specific Styles
    otpInstruction: {
      color: TEXT_GRAY,
      fontSize: '0.9rem',
      lineHeight: '1.5',
      textAlign: 'left',
      marginBottom: '1.5rem',
    },
    otpButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '1rem',
    },
    backBtn: {
      background: 'transparent',
      color: GREEN_PRIMARY, // Green Text
      border: `1px solid ${GREEN_PRIMARY}`, // Green Border
      padding: '0.9rem 2rem',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
    },
  };
  
  // State for focus tracking
  const [focusedField, setFocusedField] = useState(null);

  const handleFocus = (name) => setFocusedField(name);
  const handleBlur = () => setFocusedField(null);

  return (
    <div style={styles.container}>
      
      {/* CSS Animations and Global Body Style */}
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          body {
            margin: 0;
            padding: 0;
            background: ${INPUT_BG};
            overflow: ${isMobile ? 'auto' : 'hidden'};
          }
        `}
      </style>

      <div style={styles.mainCard}>
        {/* Left Panel - Image Section */}
        {!isMobile && (
          <div style={styles.leftPanel}>
            <div style={styles.imageOverlay}></div>
            <img 
              src={sidebarImage} 
              alt="Welcome" 
              style={styles.sidebarImg}
            />
            <div style={styles.leftContent}>
              <h2 style={styles.leftTitle}>Start Your Success Story</h2>
              <p style={styles.leftSubtitle}>
                Join a platform built for the future. Experience seamless service and community growth.
              </p>
            </div>
          </div>
        )}
        
        {/* Right Panel - Form Section */}
        <div style={styles.rightPanel}>
          <div style={styles.formContainer}>
            
            {/* Mobile Image (Show only on Mobile) */}
            {isMobile && (
                <div style={styles.mobileImageContainer}>
                    <img 
                        src={sidebarImage} 
                        alt="Welcome" 
                        style={styles.mobileImage}
                    />
                </div>
            )}
            
            {step === 1 ? (
              <>
                <h1 style={styles.title}>Create Your Account</h1>
                <p style={styles.loginLink}>
                  Already a member?{' '}
                  <a 
                    href="/login" 
                    style={styles.link}
                    // Green Hover Effect
                    onMouseEnter={(e) => e.target.style.color = GREEN_DARK}
                    onMouseLeave={(e) => e.target.style.color = GREEN_PRIMARY}
                  >
                    Log in
                  </a>
                </p>

                <form onSubmit={handleRegister} style={styles.form}>
                  {/* Messages */}
                  {message && <div style={styles.successMsg}>{message}</div>}
                  {error && <div style={styles.errorMsg}>{error}</div>}

                  {/* Username Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'username' && styles.inputFocused)
                      }}
                      placeholder="john_doe"
                      required
                      onFocus={() => handleFocus('username')}
                      onBlur={handleBlur}
                    />
                  </div>

                  {/* Email Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'email' && styles.inputFocused)
                      }}
                      placeholder="you@example.com"
                      required
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                    />
                  </div>

                  {/* Password Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'password' && styles.inputFocused)
                      }}
                      placeholder="••••••••"
                      required
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'confirm_password' && styles.inputFocused)
                      }}
                      placeholder="Re-enter password"
                      required
                      onFocus={() => handleFocus('confirm_password')}
                      onBlur={handleBlur}
                    />
                  </div>

                  {/* Referral Code Field */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Referral Code (Optional)</label>
                    <input
                      type="text"
                      name="referral_input"
                      value={formData.referral_input}
                      onChange={handleInputChange}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'referral_input' && styles.inputFocused)
                      }}
                      placeholder="Enter code if you have one"
                      onFocus={() => handleFocus('referral_input')}
                      onBlur={handleBlur}
                    />
                  </div>

                  {/* Terms Checkbox */}
                  <div style={styles.checkboxGroup}>
                    <input 
                      type="checkbox" 
                      id="terms" 
                      required 
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: GREEN_PRIMARY, // Green Checkbox
                        marginTop: '2px',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="terms" style={styles.checkboxLabel}>
                      I agree to the firm's <a 
                        href="#" 
                        style={styles.link}
                        onMouseEnter={(e) => e.target.style.color = GREEN_DARK}
                        onMouseLeave={(e) => e.target.style.color = GREEN_PRIMARY}
                      >
                        Terms & Conditions
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    style={{
                      ...styles.registerBtn,
                      ...(loading && styles.btnLoading)
                    }}
                    disabled={loading}
                    // Simple Y-Axis Animation for professional touch
                    onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                  >
                    {loading ? 'Processing...' : 'Get Started'}
                  </button>
                </form>
              </>
            ) : (
              // OTP Verification Step
              <>
                <h1 style={styles.title}>Verify Your Email</h1>
                <p style={styles.otpInstruction}>
                  A 6-digit verification code has been sent to:<br />
                  <strong style={{color: TEXT_DARK}}>{otpData.email}</strong>. Please check your inbox.
                </p>

                <form onSubmit={handleVerifyOtp} style={styles.form}>
                  {/* Messages (placed here to be visible in step 2) */}
                  {message && <div style={styles.successMsg}>{message}</div>}
                  {error && <div style={styles.errorMsg}>{error}</div>}
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Enter OTP Code</label>
                    <input
                      type="text"
                      name="otp"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                      style={{
                        ...styles.input,
                        ...(focusedField === 'otp' && styles.inputFocused)
                      }}
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength="6"
                      inputMode="numeric"
                      pattern="[0-9]{6}" 
                      onFocus={() => handleFocus('otp')}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div style={styles.otpButtons}>
                    <button 
                      type="submit" 
                      style={{
                        ...styles.registerBtn,
                        ...(loading && styles.btnLoading)
                      }}
                      disabled={loading}
                      onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-3px)')}
                      onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                    >
                      {loading ? 'Verifying...' : 'Complete Verification'}
                    </button>
                    <button 
                      type="button" 
                      style={styles.backBtn}
                      onClick={() => {
                          setStep(1);
                          setError('');
                          setMessage('');
                      }}
                      // Invert Color Hover Effect
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = GREEN_PRIMARY;
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = `0 4px 10px ${GREEN_PRIMARY}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = GREEN_PRIMARY;
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Back to Registration
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
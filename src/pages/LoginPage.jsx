import React, { useState, useEffect } from 'react'; // <-- SYNTAX ERROR FIXED HERE
import axios from 'axios';
// ✅ CORRECTION: Changed 'saveToken' to the available export 'saveAccessToken'
// We only need saveAccessToken for the access token we receive, as refresh is saved directly in sessionStorage.
import BASE_URL, { saveAccessToken } from '../api/baseURL'; 
import sidebarImage from '../assets/images/sidebar.png';

function LoginPage() {
const [formData, setFormData] = useState({
email: '',
password: ''
});

const [message, setMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [windowWidth, setWindowWidth] = useState(window.innerWidth);

// Real-time responsiveness setup
useEffect(() => {
const handleResize = () => setWindowWidth(window.innerWidth);
window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

const isMobile = windowWidth <= 768;

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleLogin = async (e) => {
e.preventDefault();
setIsLoading(true);
setMessage(''); 
try {
const res = await axios.post(`${BASE_URL}/accounts/login/`, formData);
const { access, refresh } = res.data;

// ✅ Save tokens in sessionStorage
sessionStorage.setItem('accessToken', access);
sessionStorage.setItem('refreshToken', refresh);
// ✅ CORRECTION: Use the imported function 'saveAccessToken'
saveAccessToken(access); 

setMessage('Login successful! Redirecting...');
setTimeout(() => {
window.location.href = '/';
}, 1500);
} catch (err) {
// Handle detailed error response from server if available
const errorMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
setMessage(errorMsg);
} finally {
setIsLoading(false);
}
};

// --- COLOR CONSTANTS (Light Theme + Dark Green Scheme) ---
const GREEN_PRIMARY = '#0a520d';   // Main Dark Green
const GREEN_DARK = '#073c09';      // Darker Green for gradient
const GREEN_LIGHT = '#388E3C';     // Lighter Green for links/hover
const BG_LIGHT = '#F0F4F8';        // Light Grey Background
const FORM_CARD_BG = '#FFFFFF';    // White Form Card Background
const INPUT_BG = '#F8FAFC';        // Very Light Input Background
const INPUT_BG_FILLED = '#E2E8F0'; // Light Grey Input Focus BG
const TEXT_DARK = '#1E293B';       // Primary Dark Text
const TEXT_GRAY = '#64748B';       // Medium Grey for sub-text
const BORDER_COLOR = '#E2E8F0';    // Light Border Color


// --- ENHANCED STYLES (Light Green Theme Applied) ---
const styles = {
// 1. Container
container: {
minHeight: '100vh',
width: '100vw',
background: BG_LIGHT, // Light Background
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
background: FORM_CARD_BG, // White Card Background
borderRadius: isMobile ? '0' : '20px',
overflow: 'hidden',
boxShadow: isMobile ? 'none' : '0 15px 40px rgba(0, 0, 0, 0.1)', // Lighter shadow
animation: 'slideUp 0.6s ease-out',
flexDirection: isMobile ? 'column-reverse' : 'row', 
border: isMobile ? 'none' : `1px solid ${BORDER_COLOR}`,
},

// 3. Left Panel - FORM SECTION
leftPanel: {
flex: 1,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
background: FORM_CARD_BG, // White Panel
overflowY: isMobile ? 'auto' : 'hidden',
},
formContainer: {
width: '100%',
maxWidth: '420px',
animation: 'fadeIn 0.6s ease-out',
},
title: {
fontSize: isMobile ? '1.8rem' : '2.1rem',
fontWeight: '800',
color: TEXT_DARK, // Dark Text
marginBottom: '0.5rem',
textAlign: 'left',
background: 'none',
WebkitBackgroundClip: 'unset',
WebkitTextFillColor: TEXT_DARK,
backgroundClip: 'unset',
},
loginLink: {
color: TEXT_GRAY,
fontSize: '0.95rem',
marginBottom: '2.5rem',
textAlign: 'left',
fontWeight: '400',
},
link: {
color: GREEN_PRIMARY, // Dark Green Link
textDecoration: 'none',
fontWeight: '600',
transition: 'all 0.2s ease',
borderBottom: '1px solid transparent',
},
form: {
display: 'flex',
flexDirection: 'column',
gap: '1.3rem',
},
formGroup: {
display: 'flex',
flexDirection: 'column',
gap: '0.6rem',
},
label: {
color: TEXT_DARK, // Dark Label Text
fontSize: '0.9rem',
fontWeight: '600',
textAlign: 'left',
letterSpacing: '0.3px',
},
// 4. Enhanced Input Fields
input: {
padding: '1rem 1.2rem',
borderRadius: '12px',
fontSize: '0.95rem',
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
outline: 'none',
fontFamily: 'inherit',
backgroundColor: INPUT_BG, // Very Light BG
color: TEXT_DARK, // Dark Text
border: `2px solid ${BORDER_COLOR}`,
width: '100%',
boxSizing: 'border-box',
fontWeight: '400',
},
inputFocused: {
backgroundColor: INPUT_BG_FILLED, // Light Grey Focus BG
border: `2px solid ${GREEN_PRIMARY}`, // Dark Green Focus Border
boxShadow: `0 0 0 4px ${GREEN_PRIMARY}20`,
transform: 'translateY(-1px)',
},

// 5. Enhanced Button Styles
registerBtn: {
// Dark Green Gradient Button
background: `linear-gradient(135deg, ${GREEN_PRIMARY} 0%, ${GREEN_DARK} 100%)`, 
color: 'white',
border: 'none',
padding: '1.2rem 2rem',
borderRadius: '12px',
fontSize: '1rem',
fontWeight: '700',
cursor: 'pointer',
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
marginTop: '0.5rem',
width: '100%',
letterSpacing: '0.5px',
position: 'relative',
overflow: 'hidden',
boxShadow: `0 8px 15px ${GREEN_PRIMARY}40`, // Dark Green Shadow
},
btnLoading: {
opacity: 0.8,
cursor: 'not-allowed',
transform: 'none !important',
boxShadow: 'none',
},

// 6. Enhanced Message Styles
successMsg: {
color: '#047857', // Darker success green
fontSize: '0.9rem',
padding: '1rem',
borderRadius: '8px',
backgroundColor: '#04785720',
textAlign: 'center',
border: '1px solid #04785740',
fontWeight: '500',
},
errorMsg: {
color: '#B91C1C', // Darker error red
fontSize: '0.9rem',
padding: '1rem',
borderRadius: '8px',
backgroundColor: '#B91C1C20',
textAlign: 'center',
border: '1px solid #B91C1C40',
fontWeight: '500',
},

// **NEW STYLE: Mobile Image Container**
mobileImageContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '2rem',
},
// **NEW STYLE: Mobile Circular Image**
mobileImage: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `3px solid ${GREEN_PRIMARY}`, // Dark Green Border
    boxShadow: `0 0 0 8px ${FORM_CARD_BG}`,
},

// 7. Right Panel - IMAGE SECTION (Dark Green Contrast Panel)
rightPanel: {
flex: isMobile ? '0 0 0' : 1.3, 
background: GREEN_DARK, // Deep Green/Dark BG for visual contrast
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
position: 'relative',
overflow: 'hidden',
flexDirection: isMobile ? 'row' : 'column',
padding: isMobile ? '0' : '0', 
},
sidebarImg: {
width: '100%',
height: '100%',
objectFit: 'cover',
display: 'block',
filter: 'brightness(0.9) grayscale(0.2)', // Slightly desaturated for professional look
},
rightContent: {
position: isMobile ? 'relative' : 'absolute',
bottom: isMobile ? 'auto' : '80px',
left: isMobile ? 'auto' : '50px',
right: isMobile ? 'auto' : '50px',
textAlign: isMobile ? 'center' : 'left',
color: 'white',
zIndex: 3,
padding: isMobile ? '1rem' : '0',
width: isMobile ? '100%' : 'auto',
},
companyName: {
fontSize: isMobile ? '1.5rem' : '2.8rem',
fontWeight: '900',
color: 'white',
marginBottom: isMobile ? '0.5rem' : '1.5rem',
textShadow: '0 4px 15px rgba(0, 0, 0, 0.7)',
background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
backgroundClip: 'text',
},
rightTitle: {
fontSize: isMobile ? '1.1rem' : '2.4rem',
fontWeight: '800',
lineHeight: 1.1,
marginBottom: isMobile ? '0.5rem' : '1rem',
textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
display: isMobile ? 'none' : 'block',
},
rightSubtitle: {
fontSize: isMobile ? '0.8rem' : '1.1rem',
opacity: 0.95,
lineHeight: '1.6',
textShadow: '0 1px 5px rgba(0, 0, 0, 0.5)',
fontWeight: '400',
display: isMobile ? 'none' : 'block',
},

// 9. Footer Link
footer: {
textAlign: 'center',
marginTop: '2rem',
paddingTop: '2rem',
borderTop: `1px solid ${BORDER_COLOR}`, // Light Border
color: TEXT_GRAY,
fontSize: '0.9rem',
},
};
// State for focus tracking
const [focusedField, setFocusedField] = useState(null);

const handleFocus = (name) => setFocusedField(name);
const handleBlur = () => setFocusedField(null);

return (
<div style={styles.container}>
{/* CSS Animations */}
<style>
{`
@keyframes slideUp {
from { opacity: 0; transform: translateY(30px) scale(0.98); }
to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeIn {
from { opacity: 0; transform: translateX(20px); }
to { opacity: 1; transform: translateX(0); }
}
@keyframes buttonShine {
0% { transform: translateX(-100%) rotate(45deg); }
100% { transform: translateX(200%) rotate(45deg); }
}
body {
margin: 0;
padding: 0;
background: ${BG_LIGHT}; /* Light BG for body */
overflow: ${isMobile ? 'auto' : 'hidden'};
}
.btn-shine:hover::before {
content: '';
position: absolute;
top: 0;
left: -100%;
width: 50%;
height: 100%;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
animation: buttonShine 0.8s ease;
}
`}
</style>

<div style={styles.mainCard}>

{/* Left Panel - FORM SECTION */}
<div style={styles.leftPanel}>
<div style={styles.formContainer}>
{/* **NEW BLOCK: Mobile Image (Show only on Mobile)** */}
{isMobile && (
    <div style={styles.mobileImageContainer}>
        <img 
            src={sidebarImage} 
            alt="Welcome" 
            style={styles.mobileImage}
        />
    </div>
)}

<h1 style={styles.title}>Welcome Back</h1>
<p style={styles.loginLink}>
Don't have an account?{' '}
<a
href="/register"
style={styles.link}
// Green Hover Effect
onMouseEnter={(e) => {
e.target.style.color = GREEN_LIGHT;
e.target.style.borderBottomColor = GREEN_LIGHT;
}}
onMouseLeave={(e) => {
e.target.style.color = GREEN_PRIMARY;
e.target.style.borderBottomColor = 'transparent';
}}
>
Create Account
</a>
</p>

<form onSubmit={handleLogin} style={styles.form}>
{/* Email Field */}
<div style={styles.formGroup}>
<label style={styles.label}>Email Address</label>
<input
type="email"
name="email"
value={formData.email}
onChange={handleChange}
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
onChange={handleChange}
style={{
...styles.input,
...(focusedField === 'password' && styles.inputFocused)
}}
placeholder="Enter your password"
required
onFocus={() => handleFocus('password')}
onBlur={handleBlur}
/>
</div>

{/* Messages */}
{message && (
<div style={message.includes('successful') ? styles.successMsg : styles.errorMsg}>
{message}
</div>
)}

{/* Submit Button */}
<button
type="submit"
style={{
...styles.registerBtn,
...(isLoading && styles.btnLoading)
}}
disabled={isLoading}
className="btn-shine"
// Animation Hover
onMouseEnter={(e) => !isLoading && (e.target.style.transform = 'translateY(-3px)')}
onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
>
{isLoading ? (
<>
<span style={{ opacity: 0.9 }}>Signing In...</span>
</>
) : (
<>
<span>Sign In</span>
</>
)}
</button>
</form>

{/* Footer */}
<div style={styles.footer}>
<a
href="/forgot-password"
style={styles.link}
// Green Hover Effect
onMouseEnter={(e) => {
e.target.style.color = GREEN_LIGHT;
e.target.style.borderBottomColor = GREEN_LIGHT;
}}
onMouseLeave={(e) => {
e.target.style.color = GREEN_PRIMARY;
e.target.style.borderBottomColor = 'transparent';
}}
>
Forgot Password?
</a>
</div>
</div>
</div>
{/* Right Panel - IMAGE SECTION (Dark Green Contrast Panel) */}
<div style={styles.rightPanel}>
{/* Conditional rendering for desktop image panel content */}
{!isMobile && (
    <>
        <img
            src={sidebarImage}
            alt="Investment Platform"
            style={styles.sidebarImg}
        />
        <div style={styles.rightContent}>
            <div style={styles.companyName}>Investment Accounting</div>
            <h2 style={styles.rightTitle}>Continue Your Journey</h2>
            <p style={styles.rightSubtitle}>
                Access your investment portfolio and continue growing your wealth with our secure platform.
            </p>
        </div>
    </>
)}
</div>
</div>
</div>
);
}

export default LoginPage;
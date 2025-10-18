import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Assuming the correct path to baseURL.js is this (adjust if needed based on your file structure)
import BASE_URL, { removeTokens } from '../api/baseURL';

function DashboardPage() {
const navigate = useNavigate();
// We now store username in state, initialized to null
const [username, setUsername] = useState(null);
const [loading, setLoading] = useState(true);
// Balance is now dynamic, initialized to 0
const [balance, setBalance] = useState(0);
// Dummy data (PKR currency) - these remain hardcoded for presentation
const [todayProfit] = useState(5600);
const [totalDeposit] = useState(750000);
const [totalProfit] = useState(112500);
const [activePlan] = useState("20 Marla - ₨5,600/day");
const [teamMembers] = useState(23);
const [activeDays] = useState(67);
// Active tab state
const [activeTab, setActiveTab] = useState('home');
const [hoveredCard, setHoveredCard] = useState(null);
const [hoveredAction, setHoveredAction] = useState(null);
// --- API Call Helper Function - Updated to handle both balance and username ---
const fetchWalletDetail = async (token) => {
try {
// API call to fetch balance AND username (as per your specified response format)
const walletResponse = await axios.get(`${BASE_URL}/transactions/wallet/detail/`, {
headers: {
Authorization: `Bearer ${token}`
}
});
// Update state with data from the single API call
setBalance(parseFloat(walletResponse.data.balance));
setUsername(walletResponse.data.username);

} catch (error) {
console.error('Wallet detail fetch failed:', error);
// If this call fails, we assume authentication has failed or the token is bad
removeTokens();
navigate('/login');
}
};

// Check authentication and get user data
useEffect(() => {
const checkAuthAndFetchData = async () => {
const token = sessionStorage.getItem('accessToken');
if (!token) {
navigate('/login');
setLoading(false); // Stop loading if redirecting
return;
}

// We only call the one required API endpoint
await fetchWalletDetail(token);
setLoading(false);
};

checkAuthAndFetchData();
}, [navigate]);

// Handle logout (updated to use removeTokens helper)
const handleLogout = () => {
removeTokens();
navigate('/login');
};

// --- COLOR CONSTANTS (Same as Register/Login) ---
const PURPLE_PRIMARY = '#8B5CF6';
const PURPLE_DARK = '#7C3AED';
const PURPLE_LIGHT = '#A78BFA';
const DARK_BG = '#0F0F23';
const FORM_CARD_BG = '#1A1B2F';
const INPUT_BG = '#252641';
const TEXT_LIGHT = '#F8FAFC';
const TEXT_GRAY = '#94A3B8';
const TEXT_DARK_GRAY = '#64748B';
const SUCCESS_GREEN = '#10B981';
const WARNING_AMBER = '#F59E0B';
const ERROR_RED = '#EF4444';

// --- ENHANCED STYLES ---
const styles = {
// 1. Container
container: {
minHeight: '100vh',
background: DARK_BG,
color: TEXT_LIGHT,
fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
position: 'relative',
paddingBottom: '90px',
overflowX: 'hidden'
},

// 2. Header with User Info
// *FIXED: Added 'Home' button equivalent logic by adding a logo/icon placeholder*
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
flex: 1,
display: 'flex',
alignItems: 'center',
gap: '12px'
},
// New style for Home/Logo button in Header
homeLogo: {
fontSize: '24px',
color: PURPLE_PRIMARY,
fontWeight: '800',
padding: '8px 10px',
borderRadius: '12px',
background: 'rgba(139, 92, 246, 0.1)',
cursor: 'pointer',
lineHeight: 1,
border: `1px solid ${PURPLE_PRIMARY}30`
},
userInfo: {
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
background: 'rgba(239, 68, 68, 0.2)',
border: `1px solid rgba(239, 68, 68, 0.3)`,
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
notificationDot: {
position: 'absolute',
top: '10px',
right: '10px',
width: '8px',
height: '8px',
background: ERROR_RED,
borderRadius: '50%'
},

// 3. Balance Card
balanceCard: {
background: `linear-gradient(135deg, ${PURPLE_PRIMARY} 0%, ${PURPLE_DARK} 100%)`,
margin: '16px',
padding: '28px 24px',
borderRadius: '24px',
boxShadow: `0 20px 40px ${PURPLE_PRIMARY}30`,
position: 'relative',
overflow: 'hidden',
animation: 'slideUp 0.8s ease-out 0.2s both'
},
balanceLabel: {
fontSize: '14px',
color: 'rgba(255, 255, 255, 0.8)',
marginBottom: '8px',
fontWeight: '500'
},
balanceAmount: {
fontSize: '38px',
fontWeight: '800',
color: TEXT_LIGHT,
marginBottom: '16px',
letterSpacing: '0.5px',
textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
},
profitContainer: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center'
},
profitBadge: {
fontSize: '15px',
color: SUCCESS_GREEN,
fontWeight: '600',
display: 'flex',
alignItems: 'center',
gap: '8px',
background: 'rgba(16, 185, 129, 0.15)',
padding: '8px 16px',
borderRadius: '20px',
border: `1px solid ${SUCCESS_GREEN}30`
},
currencyText: {
fontSize: '12px',
color: 'rgba(255, 255, 255, 0.7)',
fontWeight: '500'
},

// 4. Stats Grid
statsGrid: {
display: 'grid',
gridTemplateColumns: '1fr 1fr',
gap: '14px',
padding: '0 16px',
marginBottom: '28px',
animation: 'slideUp 0.8s ease-out 0.4s both'
},
statCard: {
background: FORM_CARD_BG,
padding: '20px 16px',
borderRadius: '18px',
border: `1px solid ${TEXT_DARK_GRAY}30`,
backdropFilter: 'blur(10px)',
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
cursor: 'pointer'
},
statCardHover: {
transform: 'translateY(-4px)',
borderColor: PURPLE_PRIMARY,
boxShadow: `0 12px 30px ${PURPLE_PRIMARY}20`
},
statLabel: {
fontSize: '13px',
color: TEXT_GRAY,
marginBottom: '10px',
fontWeight: '500'
},
statValue: {
fontSize: '22px',
fontWeight: '700',
color: TEXT_LIGHT,
display: 'flex',
alignItems: 'baseline',
gap: '4px'
},
currencySymbol: {
fontSize: '14px',
color: WARNING_AMBER,
fontWeight: '600'
},

// 5. Quick Actions
quickActions: {
padding: '0 16px',
marginBottom: '28px',
animation: 'slideUp 0.8s ease-out 0.6s both'
},
sectionTitle: {
fontSize: '18px',
fontWeight: '600',
color: TEXT_LIGHT,
marginBottom: '18px',
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center'
},
viewAllBtn: {
fontSize: '12px',
color: PURPLE_PRIMARY,
fontWeight: '600',
cursor: 'pointer',
transition: 'all 0.3s ease',
padding: '6px 12px',
borderRadius: '8px'
},
actionsGrid: {
// *FIXED: Increased gap for better spacing between buttons*
display: 'grid',
gridTemplateColumns: 'repeat(4, 1fr)',
gap: '20px', // Increased from 14px to 20px for more space
maxWidth: '500px', // Adjusted max width slightly if needed with increased gap
margin: '0 auto', // Centers the grid container
padding: '0 10px', // Add padding to the grid itself for spacing from edges
},
actionButton: {
background: FORM_CARD_BG,
border: `1px solid ${TEXT_DARK_GRAY}30`,
borderRadius: '16px',
padding: '20px 8px',
textAlign: 'center',
cursor: 'pointer',
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
},
actionButtonHover: {
transform: 'translateY(-4px)',
borderColor: PURPLE_PRIMARY,
boxShadow: `0 12px 30px ${PURPLE_PRIMARY}20`,
background: `linear-gradient(135deg, ${FORM_CARD_BG}, rgba(139, 92, 246, 0.1))`
},
actionIcon: {
fontSize: '28px',
background: 'rgba(139, 92, 246, 0.1)',
width: '54px',
height: '54px',
borderRadius: '16px',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
margin: '0 auto 14px',
border: `1px solid ${PURPLE_PRIMARY}30`,
transition: 'all 0.3s ease'
},
actionIconHover: {
transform: 'scale(1.1)',
background: 'rgba(139, 92, 246, 0.2)'
},
actionLabel: {
fontSize: '12px',
color: TEXT_LIGHT,
fontWeight: '600'
},

// 6. Active Plan Card
planCard: {
background: FORM_CARD_BG,
margin: '16px',
padding: '24px',
borderRadius: '20px',
border: `1px solid ${TEXT_DARK_GRAY}30`,
backdropFilter: 'blur(10px)',
boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
animation: 'slideUp 0.8s ease-out 0.8s both'
},
planHeader: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: '18px'
},
planTitle: {
fontSize: '17px',
fontWeight: '600',
color: TEXT_LIGHT
},
planStatus: {
background: `linear-gradient(135deg, ${SUCCESS_GREEN}, #22d3ee)`,
color: TEXT_LIGHT,
padding: '8px 16px',
borderRadius: '20px',
fontSize: '12px',
fontWeight: '700',
boxShadow: `0 6px 20px ${SUCCESS_GREEN}30`
},
planDetails: {
fontSize: '15px',
color: TEXT_GRAY,
marginBottom: '22px',
fontWeight: '500'
},
progressContainer: {
marginBottom: '14px'
},
progressInfo: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: '10px',
fontSize: '13px',
color: TEXT_GRAY
},
progressBar: {
background: 'rgba(255, 255, 255, 0.1)',
borderRadius: '12px',
height: '8px',
overflow: 'hidden'
},
progressFill: {
background: `linear-gradient(90deg, ${PURPLE_PRIMARY}, ${PURPLE_DARK})`,
height: '100%',
width: '65%',
borderRadius: '12px',
boxShadow: `0 2px 12px ${PURPLE_PRIMARY}40`,
animation: 'progressFill 1.5s ease-out'
},

// 7. Recent Activity
recentActivity: {
padding: '0 16px',
marginBottom: '24px',
animation: 'slideUp 0.8s ease-out 1s both'
},
emptyState: {
background: FORM_CARD_BG,
textAlign: 'center',
padding: '40px 20px',
borderRadius: '18px',
border: `1px solid ${TEXT_DARK_GRAY}30`,
backdropFilter: 'blur(10px)'
},
emptyIcon: {
fontSize: '52px',
opacity: '0.3',
marginBottom: '16px'
},

// 8. Bottom Navigation
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
// *FIXED: Adjusted padding and margin to give space and better visual*
padding: '10px 14px',
borderRadius: '16px',
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
flex: 1,
margin: '0 4px', // This spacing works well between items
maxWidth: '100px' // Added max width for better centering on larger screens
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
color: TEXT_GRAY, // Default color for icons
},
navIconActive: {
transform: 'scale(1.15)',
color: PURPLE_PRIMARY, // Active color for icons
},
navLabel: {
fontSize: '11px',
fontWeight: '500',
color: TEXT_GRAY,
transition: 'all 0.3s ease'
}
,
navLabelActive: {
color: PURPLE_PRIMARY,
fontWeight: '700'
},

// 9. Loading State
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
loadingText: {
color: TEXT_GRAY,
fontSize: '16px',
fontWeight: '500'
}
};

// CSS Animations
const styleTag = `
@keyframes slideDown {
from {
opacity: 0;
transform: translateY(-30px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
@keyframes slideUp {
from {
opacity: 0;
transform: translateY(30px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
@keyframes progressFill {
from { width: 0%; }
to { width: 65%; }
}
@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}
.btn-hover:hover {
transform: translateY(-2px);
box-shadow: 0 8px 25px ${PURPLE_PRIMARY}20;
}
`;

// Show loading state
if (loading) {
return (
<div style={styles.loadingContainer}>
<style>{styleTag}</style>
<div style={styles.spinner}></div>
<div style={styles.loadingText}>Loading your dashboard...</div>
</div>
);
}
// Determine displayed username
const displayUserName = username || 'Guest';

// --- HANDLERS FOR NAVIGATION ---

// Navigate function for Bottom Nav & Quick Actions
const navigateTo = (route, tabId) => {
setActiveTab(tabId);
// Token is handled via session storage and the useEffect check, so simple navigate is enough
navigate(route);
};

return (
<div style={styles.container}>
<style>{styleTag}</style>
{/* Header (UPDATED FOR PROFESSIONAL LOOK & HOME/LOGO) */}
<div style={styles.header}>
    <div style={styles.headerLeft}>
        {/* Home/Logo Button */}
        <div 
            style={styles.homeLogo}
            onClick={() => navigateTo('/dashboard', 'home')}
        >
            ₿
        </div>
        {/* User Info */}
        <div style={styles.userInfo}>
            <div style={styles.welcomeText}>As-salamu alaykum,</div>
            <div style={styles.userName}>
                {displayUserName}
            </div>
        </div>
    </div>
    <div
        style={styles.notificationBtn}
        className="btn-hover"
        onClick={() => navigate('/notifications')} // Assuming a notifications route
    >
        <span>🔔</span>
        <div style={styles.notificationDot}></div>
    </div>
</div>

{/* Balance Card - Now displays dynamic balance */}
<div style={styles.balanceCard}>
<div style={styles.balanceLabel}>Total Balance</div>
<div style={styles.balanceAmount}>
₨{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>
<div style={styles.profitContainer}>
<div style={styles.profitBadge}>
<span>📈</span> Today: +₨{todayProfit.toLocaleString()}
</div>
<div style={styles.currencyText}>PKR • Pakistani Rupee</div>
</div>
</div>

{/* Stats Grid */}
<div style={styles.statsGrid}>
{[
{ label: 'Total Deposit', value: totalDeposit, currency: true },
{ label: 'Active Days', value: activeDays, suffix: 'days' },
{ label: 'Team Members', value: teamMembers, suffix: 'people' },
{ label: 'Total Profit', value: totalProfit, currency: true }
].map((stat, index) => (
<div
key={index}
style={
hoveredCard === index
? { ...styles.statCard, ...styles.statCardHover }
: styles.statCard
}
onMouseEnter={() => setHoveredCard(index)}
onMouseLeave={() => setHoveredCard(null)}
>
<div style={styles.statLabel}>{stat.label}</div>
<div style={styles.statValue}>
{stat.currency && <span style={styles.currencySymbol}>₨</span>}
{stat.value.toLocaleString()}
{stat.suffix && <span style={{fontSize: '14px', color: TEXT_GRAY}}> {stat.suffix}</span>}
</div>
</div>
))}
</div>

{/* Quick Actions (UPDATED FOR ROUTING & CENTER LAYOUT) */}
<div style={styles.quickActions}>
<div style={styles.sectionTitle}>
<span>Quick Actions</span>
<span
style={styles.viewAllBtn}
className="btn-hover"
onClick={() => navigate('/transactions')} // Assuming a transactions or history route
>
View All
</span>
</div>
{/* Added max width and margin: '0 auto' to actionsGrid style to center it */}
<div style={styles.actionsGrid}>
{[
// *FIXED: Added navigation handlers for each action & Withdraw icon*
{ icon: '💰', label: 'Deposit', route: '/deposit', tabId: 'deposit' },
{ icon: '📈', label: 'Invest', route: '/invest', tabId: 'invest' },
{ icon: '👥', label: 'Team', route: '/team', tabId: 'team' },
{ icon: '💸', label: 'Withdraw', route: '/withdraw', tabId: 'withdraw' } // Added a 4th for balanced grid, changed icon
].map((action, index) => (
<div
key={index}
style={
hoveredAction === index
? { ...styles.actionButton, ...styles.actionButtonHover }
: styles.actionButton
}
onMouseEnter={() => setHoveredAction(index)}
onMouseLeave={() => setHoveredAction(null)}
onClick={() => navigateTo(action.route, action.tabId)} // Using the helper
>
<div
style={
hoveredAction === index
? { ...styles.actionIcon, ...styles.actionIconHover }
: styles.actionIcon
}
>
{action.icon}
</div>
<div style={styles.actionLabel}>{action.label}</div>
</div>
))}
</div>
</div>

{/* Active Plan */}
<div style={styles.planCard}>
<div style={styles.planHeader}>
<div style={styles.planTitle}>Active Investment Plan</div>
<div style={styles.planStatus}>ACTIVE</div>
</div>
<div style={styles.planDetails}>{activePlan}</div>
<div style={styles.progressContainer}>
<div style={styles.progressInfo}>
<span>Progress</span>
<span>65% Complete</span>
</div>
<div style={styles.progressBar}>
<div style={styles.progressFill}></div>
</div>
</div>
<div style={{...styles.progressInfo, fontSize: '12px', marginBottom: '0'}}>
<span>Started: 15 Jan 2024</span>
<span>23 days remaining</span>
</div>
</div>

{/* Recent Activity */}
<div style={styles.recentActivity}>
<div style={styles.sectionTitle}>
<span>Recent Activity</span>
<span style={styles.viewAllBtn}>See All</span>
</div>
<div style={styles.emptyState}>
<div style={styles.emptyIcon}>💸</div>
<div style={{...styles.statLabel, marginBottom: '8px', fontSize: '14px'}}>
No recent transactions
</div>
<div style={{fontSize: '12px', color: TEXT_GRAY}}>
Your recent activity will appear here
</div>
</div>
</div>

{/* Bottom Navigation (UPDATED FOR ROUTING & ACTIVE TAB STYLING) */}
<div style={styles.bottomNav}>
{[
// *FIXED: Set proper routes for navigation*
{ id: 'invest', icon: '🏠', label: 'Home', route: '/dashboard' },
{ id: 'invest', icon: '💼', label: 'Invest', route: '/invest' },
{ id: 'team', icon: '👥', label: 'Team', route: '/team' },
{ id: 'profile', icon: '👤', label: 'Profile', route: '/profile', onClick: handleLogout } // Profile button now handles Logout as per original code logic
].map((nav) => (
<div
key={nav.id}
style={activeTab === nav.id ? styles.navItemActive : styles.navItem}
onClick={nav.onClick ? nav.onClick : () => navigateTo(nav.route, nav.id)} // Using helper function
>
{/* *FIXED: Applied active icon style correctly, ensuring consistency* */}
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

export default DashboardPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Assuming the correct path to baseURL.js is this (adjust if needed based on your file structure)
import BASE_URL, { removeTokens } from '../api/baseURL';

// --- Helper Functions ---
const calculateProgress = (startDateStr, endDateStr) => {
    try {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        const now = new Date();

        // If the plan has not started yet, or is already ended
        if (now < start) return { progress: 0, daysLeft: Math.ceil((end - now) / (1000 * 60 * 60 * 24)), totalDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) };
        if (now > end) return { progress: 100, daysLeft: 0, totalDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) };
        
        const totalDuration = end.getTime() - start.getTime();
        const elapsedDuration = now.getTime() - start.getTime();
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

        const progress = (elapsedDuration / totalDuration) * 100;
        
        return { 
            progress: Math.min(100, progress), 
            daysLeft: daysLeft,
            totalDays: totalDays
        };
    } catch (e) {
        console.error("Progress calculation error:", e);
        return { progress: 0, daysLeft: 0, totalDays: 0 };
    }
};

// --- Dashboard Component ---
function DashboardPage() {
    const navigate = useNavigate();
    
    // --- DYNAMIC API STATES ---
    const [username, setUsername] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [totalDeposit, setTotalDeposit] = useState(0); 
    const [totalEarnedProfit, setTotalEarnedProfit] = useState(0); // NEW: Total Earned Profit
    const [activePlanDetails, setActivePlanDetails] = useState(null); // NEW: Active Plan details
    const [investmentHistory, setInvestmentHistory] = useState({ active: 0, expired: 0 }); // NEW: Active/Expired Plan Count

    // --- STATIC DUMMY DATA (for remaining cards) ---
    const [todayProfit] = useState(5600); // Placeholder, needs dedicated API later
    const [teamMembers] = useState(23); // Placeholder, needs dedicated API later
    
    const [activeTab, setActiveTab] = useState('home');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [hoveredAction, setHoveredAction] = useState(null);

    // --- COLOR CONSTANTS ---
    const PURPLE_PRIMARY = '#8B5CF6';
    const PURPLE_DARK = '#7C3AED';
    const PURPLE_LIGHT = '#A78BFA';
    const DARK_BG = '#0F0F23';
    const FORM_CARD_BG = '#1A1B2F';
    const TEXT_LIGHT = '#F8FAFC';
    const TEXT_GRAY = '#94A3B8';
    const TEXT_DARK_GRAY = '#64748B';
    const SUCCESS_GREEN = '#10B981';
    const WARNING_AMBER = '#F59E0B';
    const ERROR_RED = '#EF4444';


    // --- API FUNCTIONS ---

    // 1. Fetch Wallet and Username
    const fetchWalletDetail = async (token) => {
        try {
            const walletResponse = await axios.get(`${BASE_URL}/transactions/wallet/detail/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(parseFloat(walletResponse.data.balance || 0));
            setUsername(walletResponse.data.username);
        } catch (error) {
            console.error('Wallet detail fetch failed:', error.response ? error.response.data : error.message);
            removeTokens();
            navigate('/login');
        }
    };

    // 2. Fetch Total Deposit
    const fetchDepositHistory = async (token) => {
        try {
            const historyResponse = await axios.get(`${BASE_URL}/transactions/deposit/history/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(historyResponse.data)) {
                const calculatedTotalDeposit = historyResponse.data
                    .filter(deposit => deposit.status && deposit.status.toLowerCase() === 'approved') 
                    .reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0);
                setTotalDeposit(calculatedTotalDeposit);
            }
        } catch (error) {
            console.error('Deposit history fetch failed:', error.response ? error.response.data : error.message);
        }
    };

    // 3. Fetch Total Earned Profit (NEW API)
    const fetchProfitHistory = async (token) => {
        try {
            const profitResponse = await axios.get(`${BASE_URL}/transactions/profit/history/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(profitResponse.data)) {
                // Calculate the sum of 'total_earned' from all profit history items
                const totalEarned = profitResponse.data
                    .reduce((sum, item) => sum + parseFloat(item.total_earned || 0), 0);
                setTotalEarnedProfit(totalEarned);
            }
        } catch (error) {
            console.error('Profit history fetch failed:', error.response ? error.response.data : error.message);
        }
    };
    
    // 4. Fetch Active Plan and Plan History Count (NEW API)
    const fetchPlanHistory = async (token) => {
        try {
            const plansResponse = await axios.get(`${BASE_URL}/transactions/plans/history/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(plansResponse.data)) {
                const activePlan = plansResponse.data.find(plan => plan.status && plan.status.toLowerCase() === 'active');
                
                // Set Active Plan Details
                if (activePlan) {
                    setActivePlanDetails(activePlan);
                } else {
                    setActivePlanDetails(null);
                }

                // Calculate Plan Counts
                const activeCount = plansResponse.data.filter(plan => plan.status && plan.status.toLowerCase() === 'active').length;
                const expiredCount = plansResponse.data.filter(plan => plan.status && plan.status.toLowerCase() === 'expired').length;
                
                setInvestmentHistory({ active: activeCount, expired: expiredCount });
            }
        } catch (error) {
            console.error('Plan history fetch failed:', error.response ? error.response.data : error.message);
        }
    };


    // --- EFFECT HOOKS ---
    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                setLoading(false); 
                return;
            }

            // Call all required APIs concurrently
            await Promise.all([
                fetchWalletDetail(token),
                fetchDepositHistory(token),
                fetchProfitHistory(token), // NEW
                fetchPlanHistory(token)    // NEW
            ]);

            setLoading(false);
        };

        checkAuthAndFetchData();
    }, [navigate]);

    // --- HANDLERS ---
    const handleLogout = () => {
        removeTokens();
        navigate('/login');
    };

    // Navigate function for Bottom Nav & Quick Actions
    const navigateTo = (route, tabId) => {
        setActiveTab(tabId);
        navigate(route);
    };

    // --- STYLES (Your original styles are placed here for completeness) ---
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
        gap: '4px',
        justifyContent: 'space-between' 
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
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px', 
        maxWidth: '500px', 
        margin: '0 auto', 
        padding: '0 10px', 
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
        progressFill: (progress) => ({
        background: `linear-gradient(90deg, ${PURPLE_PRIMARY}, ${PURPLE_DARK})`,
        height: '100%',
        width: `${progress}%`,
        borderRadius: '12px',
        boxShadow: `0 2px 12px ${PURPLE_PRIMARY}40`,
        transition: 'width 1s ease-out' // Changed from animation to transition
        }),

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
        padding: '10px 14px',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flex: 1,
        margin: '0 4px', 
        maxWidth: '100px' 
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
        },
        // --- NEW STYLE FOR VIEW MORE BUTTON ---
        viewMoreLink: {
            fontSize: '12px',
            color: PURPLE_LIGHT,
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: 'rgba(167, 139, 250, 0.1)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
        },
        planHistoryDetails: {
            fontSize: '14px',
            color: TEXT_GRAY,
            fontWeight: '500',
            marginTop: '8px',
            lineHeight: '1.4',
        }
    };
    // --- END STYLES ---


    // Calculate active plan progress for rendering
    const planProgress = activePlanDetails 
        ? calculateProgress(activePlanDetails.start_date, activePlanDetails.end_date) 
        : { progress: 0, daysLeft: 0, totalDays: 0 };


    // RENDER LOGIC
    const displayUserName = username || 'Guest';

    const activePlanInfo = activePlanDetails 
        ? `${activePlanDetails.title} - ₨${parseFloat(activePlanDetails.amount).toLocaleString()}`
        : 'No Active Plan';

    // Stat Card Data Array (UPDATED)
    const statCardsData = [
        { 
            label: 'Total Deposit', 
            value: totalDeposit, 
            currency: true, 
            onClick: () => navigateTo('/DepositHistory', 'deposit'),
            showViewMore: true 
        },
        // RENAMED AND UPDATED CARD
        { 
            label: 'Plan History', 
            value: investmentHistory.active + investmentHistory.expired, 
            suffix: `(${investmentHistory.active} active)`,
            details: `Active: ${investmentHistory.active}, Expired: ${investmentHistory.expired}`,
            onClick: () => navigateTo('/PlanHistory', 'invest'),
            showViewMore: true 
        },
        { label: 'Team Members', value: teamMembers, suffix: 'people' },
        // UPDATED CARD
        { 
            label: 'Total Profit', 
            value: totalEarnedProfit, 
            currency: true, 
            // onClick: () => navigateTo('/profit-history', 'home'),
            showViewMore: true 
        }
    ];

    return (
        <div style={styles.container}>
            <style>{`/* Global CSS Animations defined in the prompt */`}</style>
            
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div 
                        style={styles.homeLogo}
                        onClick={() => navigateTo('/', 'home')}
                    >
                        ₿
                    </div>
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
                    onClick={() => navigate('/notifications')} 
                >
                    <span>🚪</span> 
                </div>
            </div>

            {/* Balance Card */}
            <div style={styles.balanceCard}>
                <div style={styles.balanceLabel}>Total Balance</div>
                <div style={styles.balanceAmount}>
                    ₨{balance != null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
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
                {statCardsData.map((stat, index) => (
                    <div
                        key={index}
                        onClick={stat.onClick || null} 
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
                            <span style={{display: 'flex', alignItems: 'baseline', gap: '4px'}}>
                                {stat.currency && <span style={styles.currencySymbol}>₨</span>}
                                {stat.value.toLocaleString()}
                                {stat.suffix && <span style={{fontSize: '14px', color: TEXT_GRAY}}> {stat.suffix}</span>}
                            </span>
                            {stat.showViewMore && (
                                <span 
                                    style={styles.viewMoreLink} 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        stat.onClick(); 
                                    }}
                                >
                                    View More
                                </span>
                            )}
                        </div>
                        {stat.details && stat.label === 'Plan History' && (
                            <div style={styles.planHistoryDetails}>
                                {stat.details}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={styles.quickActions}>
                <div style={styles.sectionTitle}>
                    <span>Quick Actions</span>
                    <span
                        style={styles.viewAllBtn}
                        className="btn-hover"
                        onClick={() => navigate('/')} 
                    >
                        View All
                    </span>
                </div>
                <div style={styles.actionsGrid}>
                    {[
                        { icon: '💰', label: 'Deposit', route: '/deposit', tabId: 'deposit' },
                        { icon: '📈', label: 'Invest', route: '/invest', tabId: 'invest' },
                        { icon: '👥', label: 'Team', route: '/', tabId: 'team' },
                        { icon: '💸', label: 'Withdraw', route: '/withdraw', tabId: 'withdraw' }
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
                            onClick={() => navigateTo(action.route, action.tabId)} 
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

            {/* Active Plan (DYNAMIC) */}
            <div style={styles.planCard}>
                <div style={styles.planHeader}>
                    <div style={styles.planTitle}>Active Investment Plan</div>
                    <div style={styles.planStatus}>
                        {activePlanDetails ? activePlanDetails.status.toUpperCase() : 'INACTIVE'}
                    </div>
                </div>
                <div style={styles.planDetails}>
                    {activePlanInfo}
                </div>
                {activePlanDetails ? (
                    <>
                        <div style={styles.progressContainer}>
                            <div style={styles.progressInfo}>
                                <span>Progress</span>
                                <span>{planProgress.progress.toFixed(1)}% Complete</span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={styles.progressFill(planProgress.progress)}></div>
                            </div>
                        </div>
                        <div style={{...styles.progressInfo, fontSize: '12px', marginBottom: '0'}}>
                            <span>Started: {new Date(activePlanDetails.start_date).toLocaleDateString()}</span>
                            <span>{planProgress.daysLeft} days remaining</span>
                        </div>
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>✨</div>
                        <div style={{...styles.statLabel, color: TEXT_LIGHT, fontSize: '14px', marginBottom: '8px'}}>
                            No Active Plan Found
                        </div>
                        <div style={{fontSize: '12px', color: TEXT_GRAY}}>
                            Time to check out the <span onClick={() => navigateTo('/invest', 'invest')} style={{color: PURPLE_PRIMARY, cursor: 'pointer', fontWeight: '600'}}>Investment Plans</span>!
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div style={styles.recentActivity}>
                <div style={styles.sectionTitle}>
                    <span>Recent Activity</span>
                    <span style={styles.viewAllBtn}>See All</span>
                </div>
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📜</div>
                    <div style={{...styles.statLabel, marginBottom: '8px', fontSize: '14px'}}>
                        No recent transactions
                    </div>
                    <div style={{fontSize: '12px', color: TEXT_GRAY}}>
                        Your recent activity will appear here
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div style={styles.bottomNav}>
                {[
                    { id: 'home', icon: '🏠', label: 'Home', route: '/' },
                    { id: 'invest', icon: '💼', label: 'Invest', route: '/invest' },
                    { id: 'team', icon: '👥', label: 'Team', route: '/' },
                    { id: 'profile', icon: '👤', label: 'Profile', route: '/profile' }
                ].map((nav) => (
                    <div
                        key={nav.id}
                        style={nav.id === activeTab ? {...styles.navItem, ...styles.navItemActive} : styles.navItem} 
                        onClick={() => navigateTo(nav.route, nav.id)}
                    >
                        <div style={nav.id === activeTab ? styles.navIconActive : styles.navIcon}>
                            {nav.icon}
                        </div>
                        <div style={nav.id === activeTab ? styles.navLabelActive : styles.navLabel}>
                            {nav.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
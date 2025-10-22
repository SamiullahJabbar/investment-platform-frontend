import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout'; 
import BASE_URL, { getAccessToken } from '../api/baseURL'; 
import { FaDollarSign, FaWallet, FaChartBar, FaUsers, FaLock, FaImage, FaHistory, FaArrowUp, FaArrowDown, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; 
import { FiLoader } from 'react-icons/fi'; 

// --- COLOR CONSTANTS ---
const GREEN_PRIMARY = '#0a520d';
const GREEN_DARK = '#073c09';      
const GREEN_LIGHT = '#388E3C';     
const BG_LIGHT = '#F0F4F8';        
const FORM_CARD_BG = '#FFFFFF';    
const INPUT_BG = '#F8FAFC'; 
const TEXT_DARK = '#1E293B';       
const TEXT_GRAY = '#64748B';       
const BORDER_COLOR = '#E2E8F0';    
const RED_ERROR = '#B91C1C';
const ORANGE_LOCKED = '#F59E0B';
const RED_WITHDRAW = '#E53E3E'; 
const BLUE_HISTORY = '#2563EB';

// --- API Endpoints ---
const PLANS_ENDPOINT = `${BASE_URL}/transactions/plans/`;
const WALLET_ENDPOINT = `${BASE_URL}/transactions/wallet/detail/`;
const INVEST_ENDPOINT = `${BASE_URL}/transactions/invest/`;

// --- CONFIRMATION MODAL COMPONENT ---
const ConfirmationModal = ({ plan, onCancel, onInvest, isMobile, isSubmitting }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const requiredText = 'confirm';
    const isConfirmationValid = confirmationText.toLowerCase() === requiredText;

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '1rem' : '2rem',
    };

    const contentStyle = {
        background: FORM_CARD_BG,
        borderRadius: '16px',
        padding: isMobile ? '1.5rem' : '2.5rem',
        maxWidth: isMobile ? '95%' : '450px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        animation: 'slideDown 0.3s ease-out',
    };
    
    const iconStyle = {
        position: 'absolute',
        top: isMobile ? '1rem' : '1.5rem',
        right: isMobile ? '1rem' : '1.5rem',
        fontSize: isMobile ? '1.2rem' : '1.5rem',
        color: TEXT_GRAY,
        cursor: 'pointer',
        transition: 'color 0.2s',
        zIndex: 10,
    };
    
    const buttonStyle = {
        background: isConfirmationValid && !isSubmitting
            ? `linear-gradient(135deg, ${GREEN_PRIMARY} 0%, ${GREEN_DARK} 100%)`
            : TEXT_GRAY,
        color: 'white',
        border: 'none',
        padding: '0.8rem 1.5rem',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: isConfirmationValid && !isSubmitting ? 'pointer' : 'not-allowed',
        width: '100%',
        marginTop: '1.5rem',
        transition: 'background 0.3s',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
    };

    return (
        <div style={modalStyle}>
            <style>
                {`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
            <div style={contentStyle}>
                <FaTimesCircle style={iconStyle} onClick={onCancel} />
                
                <h3 style={{ 
                    fontSize: isMobile ? '1.2rem' : '1.6rem', 
                    fontWeight: '800', 
                    color: GREEN_DARK, 
                    marginBottom: '1rem',
                    textAlign: 'center',
                }}>
                    Confirm Investment
                </h3>

                <p style={{ color: TEXT_DARK, textAlign: 'center', marginBottom: '1.5rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                    Are you ready to invest in the **{plan.title}** plan?
                </p>

                <div style={{ padding: '1rem', border: `1px solid ${BORDER_COLOR}`, borderRadius: '10px', background: INPUT_BG, marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: TEXT_GRAY }}>Plan Amount:</span>
                        <span style={{ fontWeight: '700', color: GREEN_PRIMARY }}>PKR {parseFloat(plan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: TEXT_GRAY }}>Total Return:</span>
                        <span style={{ fontWeight: '700', color: GREEN_DARK }}>PKR {parseFloat(plan.total_profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: isMobile ? '0.8rem' : '0.9rem', color: TEXT_DARK, marginBottom: '0.5rem', fontWeight: '600' }}>
                        Type "**{requiredText}**" below to proceed:
                    </label>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={`Type "${requiredText}"`}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            border: `2px solid ${isConfirmationValid ? GREEN_PRIMARY : BORDER_COLOR}`,
                            borderRadius: '8px',
                            backgroundColor: FORM_CARD_BG,
                            fontSize: '1rem',
                            outline: 'none',
                        }}
                        disabled={isSubmitting}
                    />
                </div>

                <button 
                    style={buttonStyle} 
                    onClick={() => isConfirmationValid && onInvest()} 
                    disabled={!isConfirmationValid || isSubmitting}
                >
                    {isSubmitting ? <FiLoader className="animate-spin" /> : <FaCheckCircle style={{fontSize: '1rem'}}/>}
                    {isSubmitting ? 'Finalizing Investment...' : 'Confirm & Invest'}
                </button>
            </div>
        </div>
    );
};


// --- INVESTMENT PLAN CARD COMPONENT ---
const PlanCard = ({ plan, onInvestSuccess, isMobile }) => {
    
    const [isHovered, setIsHovered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false); 
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); 

    const isLocked = plan.is_locked;
    const imageUrl = plan.image;

    // Function to handle the actual API call (called from modal)
    const executeInvest = async () => {
        if (isLocked || isSubmitting) return;
        
        setIsSubmitting(true);
        setMessage('');
        setMessageType('');

        const token = getAccessToken();
        if (!token) {
            setMessage('Error: User not logged in. Redirecting...');
            setMessageType('error');
            setTimeout(() => window.location.href = '/login', 1500);
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await axios.post(INVEST_ENDPOINT, { plan_id: plan.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage(res.data.message || `Congratulations! Investment in ${plan.title} activated successfully.`);
            setMessageType('success');
            
            if (onInvestSuccess) onInvestSuccess(); 

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'An unexpected error occurred.';
            setMessage(`Error: ${errorMsg}`);
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setMessage('');
                setMessageType('');
                setShowModal(false); // Close modal after showing success/error
            }, 5000); 
        }
    };
    
    // Button click now opens the modal
    const handleInvestButtonClick = () => {
        if (!isLocked) {
            setMessage(''); 
            setMessageType('');
            setShowModal(true);
        }
    };


    // --- Responsive Styles ---
    const cardStyle = {
        background: FORM_CARD_BG,
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '1rem' : '1.5rem',
        boxShadow: isLocked 
            ? '0 2px 8px rgba(245, 158, 11, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: isLocked ? `2px solid ${ORANGE_LOCKED}60` : `1px solid ${BORDER_COLOR}`,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginBottom: isMobile ? '0.5rem' : '0',
    };
    
    const buttonStyle = {
        background: isLocked 
            ? TEXT_GRAY
            : isSubmitting 
                ? GREEN_LIGHT 
                : `linear-gradient(135deg, ${GREEN_PRIMARY} 0%, ${GREEN_DARK} 100%)`,
        color: 'white',
        border: 'none',
        padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
        borderRadius: isMobile ? '8px' : '10px',
        fontSize: isMobile ? '0.85rem' : '1rem',
        fontWeight: '700',
        cursor: isLocked ? 'not-allowed' : (isSubmitting ? 'wait' : 'pointer'),
        transition: 'all 0.3s ease',
        marginTop: 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        minHeight: isMobile ? '44px' : 'auto',
    };

    const valueStyle = {
        fontSize: isMobile ? '1.1rem' : '1.5rem',
        fontWeight: '900',
        color: isLocked ? ORANGE_LOCKED : GREEN_PRIMARY,
        lineHeight: '1.2',
    };
    
    const labelStyle = {
        fontSize: isMobile ? '0.7rem' : '0.8rem',
        color: TEXT_GRAY,
        fontWeight: '500',
        marginTop: '0.2rem',
        lineHeight: '1.2',
    };

    const finalMessageStyle = {
        marginTop: '0.8rem', 
        fontSize: isMobile ? '0.7rem' : '0.9rem', 
        color: messageType === 'error' ? RED_ERROR : GREEN_PRIMARY,
        textAlign: 'center',
        padding: isMobile ? '0.3rem' : '0.5rem',
        backgroundColor: messageType === 'error' ? `${RED_ERROR}10` : `${GREEN_PRIMARY}10`,
        borderRadius: '4px',
        lineHeight: '1.3',
    };


    return (
        <>
            {/* The Confirmation Modal */}
            {showModal && (
                <ConfirmationModal
                    plan={plan}
                    onCancel={() => setShowModal(false)}
                    onInvest={executeInvest}
                    isMobile={isMobile}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* The Main Plan Card */}
            <div 
                style={{ 
                    ...cardStyle, 
                    ...(isHovered && !isLocked ? { 
                        transform: isMobile ? 'translateY(-2px)' : 'translateY(-5px)', 
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)' 
                    } : {}) 
                }}
                onMouseEnter={() => !isMobile && setIsHovered(true)}
                onMouseLeave={() => !isMobile && setIsHovered(false)}
            >
                {/* Image Section */}
                <div style={{
                    height: isMobile ? '100px' : '150px',
                    width: '100%',
                    backgroundColor: BG_LIGHT,
                    borderRadius: isMobile ? '8px' : '10px',
                    marginBottom: isMobile ? '0.8rem' : '1rem',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${BORDER_COLOR}`
                }}>
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={plan.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { 
                                e.target.style.display = 'none'; 
                                const placeholder = e.target.nextSibling;
                                if (placeholder) placeholder.style.display = 'flex'; 
                            }}
                        />
                    ) : null}
                    <div style={{ 
                        display: imageUrl ? 'none' : 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        color: TEXT_GRAY 
                    }}>
                        <FaImage style={{ fontSize: isMobile ? '1.5rem' : '3rem', marginBottom: '0.3rem' }} />
                        <span style={{ fontSize: isMobile ? '0.7rem' : '0.9rem' }}>No Image</span>
                    </div>
                </div>

                {/* Title Section */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? '0.6rem' : '1rem', 
                    borderBottom: `1px solid ${BORDER_COLOR}80`, 
                    paddingBottom: isMobile ? '0.3rem' : '0.5rem',
                    minHeight: isMobile ? 'auto' : '60px',
                }}>
                    <h2 style={{ 
                        fontSize: isMobile ? '1rem' : '1.4rem', 
                        fontWeight: '800', 
                        color: TEXT_DARK, 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        margin: 0,
                        lineHeight: '1.2',
                        flex: 1,
                    }}>
                        {plan.title}
                        {isLocked && <FaLock style={{ color: ORANGE_LOCKED, fontSize: isMobile ? '0.8rem' : '1rem', flexShrink: 0 }} />}
                    </h2>
                    <span style={{ 
                        fontSize: isMobile ? '0.7rem' : '0.8rem', 
                        fontWeight: '600', 
                        color: GREEN_LIGHT, 
                        backgroundColor: `${GREEN_PRIMARY}10`,
                        padding: isMobile ? '0.2rem 0.4rem' : '0.3rem 0.6rem',
                        borderRadius: '4px',
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                    }}>
                        {plan.duration_days}D
                    </span>
                </div>

                {/* Investment Amount */}
                <div style={{ marginBottom: isMobile ? '0.6rem' : '1rem' }}>
                    <div style={valueStyle}>
                        PKR {parseFloat(plan.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={labelStyle}>
                        Investment Amount
                    </div>
                </div>

                {/* Profit Details Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: isMobile ? '0.5rem' : '1rem',
                    textAlign: 'center',
                    padding: isMobile ? '0.3rem 0' : '0.5rem 0',
                    borderTop: `1px dashed ${BORDER_COLOR}`,
                    marginBottom: isMobile ? '0.8rem' : '1rem',
                }}>
                    <div>
                        <div style={{ ...valueStyle, color: TEXT_DARK, fontSize: isMobile ? '0.9rem' : '1.1rem' }}>
                            PKR {parseFloat(plan.daily_profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={labelStyle}>
                            Daily Profit
                        </div>
                    </div>
                    <div>
                        <div style={{ ...valueStyle, fontSize: isMobile ? '0.9rem' : '1.1rem' }}>
                            PKR {parseFloat(plan.total_profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={labelStyle}>
                            Total Return
                        </div>
                    </div>
                </div>

                {/* API Message (Error/Success) */}
                {message && (
                    <div style={finalMessageStyle}>
                        {messageType === 'success' ? '✅' : '❌'} {message}
                    </div>
                )}

                {/* Buy Button */}
                <button 
                    style={buttonStyle}
                    onClick={handleInvestButtonClick} 
                    disabled={isLocked || isSubmitting}
                    onMouseEnter={(e) => !isLocked && (e.target.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => !isLocked && (e.target.style.transform = 'translateY(0)')}
                >
                    {isLocked ? 'Locked' : 'Invest Now'}
                </button>
            </div>
        </>
    );
};


// --- Quick Action Components ---
const DesktopQuickActionButton = ({ icon: Icon, label, color, path }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const actionStyle = {
        textAlign: 'center',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0.5rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        flex: 1,
        backgroundColor: isHovered ? INPUT_BG : 'transparent',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    };

    return (
        <a 
            href={path} 
            style={actionStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Icon style={{ fontSize: '2rem', color: color, marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: TEXT_DARK }}>{label}</span>
        </a>
    );
};

const MobileQuickActionButton = ({ icon: Icon, label, color, path }) => {
    const [isPressed, setIsPressed] = useState(false);
    
    const actionStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        color: 'white',
        fontSize: '0.7rem',
        fontWeight: '600',
        padding: '8px 2px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        flex: 1,
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        minWidth: '60px',
    };
    
    const iconWrapperStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        padding: '8px',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    };

    return (
        <a 
            href={path} 
            style={actionStyle}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
        >
            <div style={iconWrapperStyle}>
                <Icon style={{ fontSize: '1.1rem', color: color }} />
            </div>
            <span style={{ textAlign: 'center', lineHeight: '1.1' }}>{label}</span>
        </a>
    );
};

// --- Main Dashboard Component ---
function Dashboard() {
    const [balance, setBalance] = useState('0.00');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const isMobile = windowWidth <= 768;

    useEffect(() => { 
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAllData = async () => {
        const token = getAccessToken();
        if (!token) {
            setError('Authentication required. Redirecting to login...');
            setTimeout(() => window.location.href = '/login', 1500);
            setLoading(false);
            return;
        }

        try {
            const walletRes = await axios.get(WALLET_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } }); 
            setBalance(parseFloat(walletRes.data.balance || 0).toFixed(2));

            const plansRes = await axios.get(PLANS_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } }); 
            setPlans(plansRes.data);
            
            setError(null);
        } catch (err) {
            setError('Failed to fetch dashboard data. Check API/Network.');
            console.error("API Error:", err.response || err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchAllData();
    }, []); 

    // --- Responsive Styles ---
    const dashboardStyles = {
        container: {
            minHeight: '100vh',
            background: BG_LIGHT,
            padding: isMobile ? '0.5rem' : '1rem',
        },
        balanceCard: {
            background: `linear-gradient(145deg, ${GREEN_PRIMARY}, ${GREEN_DARK})`,
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '1.2rem 1rem' : '2rem', 
            color: FORM_CARD_BG,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            marginBottom: isMobile ? '1rem' : '1.5rem',
            display: 'flex',
            flexDirection: 'column',
        },
        balanceContent: {
            marginBottom: isMobile ? '0.8rem' : '1rem', 
        },
        balanceTitle: {
            fontSize: isMobile ? '0.85rem' : '1.1rem',
            fontWeight: '500',
            opacity: 0.9,
            marginBottom: '0.3rem',
        },
        balanceValue: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '800',
            letterSpacing: '0.5px',
            lineHeight: '1.1',
        },
        mobileQuickActions: {
            display: isMobile ? 'flex' : 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '0.8rem',
            gap: '0.2rem',
        },
        desktopQuickActionsCard: {
            display: isMobile ? 'none' : 'flex', 
            justifyContent: 'space-around',
            backgroundColor: FORM_CARD_BG,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            marginBottom: '1.5rem',
            padding: '0.8rem 0.2rem',
        },
        plansHeader: {
            fontSize: isMobile ? '1.3rem' : '1.6rem', 
            fontWeight: '800', 
            color: TEXT_DARK, 
            marginBottom: '0.3rem',
            lineHeight: '1.2',
        },
        plansSubtitle: {
            color: TEXT_GRAY, 
            fontSize: isMobile ? '0.8rem' : '0.9rem', 
            marginBottom: isMobile ? '1rem' : '1.5rem',
            lineHeight: '1.3',
        },
        plansGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? '0.8rem' : '1.5rem',
        },
        messageStyle: {
            textAlign: 'center',
            padding: isMobile ? '1.5rem 1rem' : '2rem',
            fontSize: isMobile ? '0.9rem' : '1.1rem',
            color: TEXT_DARK,
            fontWeight: '500',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.8rem',
        },
        errorStyle: {
            background: '#FEE2E2', 
            borderRadius: '8px',
            border: `1px solid ${RED_ERROR}20`,
        },
    };

    return (
        <Layout currentPath="/invest"> 
            <div style={dashboardStyles.container}>
                {/* CSS Animations */}
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    .animate-spin {
                        animation: spin 1s linear infinite;
                    }
                    `}
                </style>

                {loading ? (
                    <div style={dashboardStyles.messageStyle}>
                        <FiLoader className="animate-spin" style={{ fontSize: '1.5rem', color: GREEN_PRIMARY }} />
                        <p>Loading Dashboard...</p>
                    </div>
                ) : error ? (
                    <div style={{ ...dashboardStyles.messageStyle, ...dashboardStyles.errorStyle }}>
                        {error}
                    </div>
                ) : (
                    <>
                        {/* 1. BALANCE CARD + MOBILE QUICK ACTIONS */}
                        <div style={dashboardStyles.balanceCard}>
                            <div style={dashboardStyles.balanceContent}>
                                <div style={dashboardStyles.balanceTitle}>Total Balance</div>
                                <div style={dashboardStyles.balanceValue}>PKR {balance}</div>
                            </div>

                            {/* Mobile Quick Actions */}
                            <div style={dashboardStyles.mobileQuickActions}>
                                <MobileQuickActionButton icon={FaDollarSign} label="Deposit" color={GREEN_PRIMARY} path="/deposit" />
                                <MobileQuickActionButton icon={FaWallet} label="Withdraw" color={RED_WITHDRAW} path="/withdraw" />
                                <MobileQuickActionButton icon={FaHistory} label="History" color={BLUE_HISTORY} path="/profit" />
                                <MobileQuickActionButton icon={FaUsers} label="Plan profit" color={GREEN_LIGHT} path="/profit" />
                            </div>
                        </div>

                        {/* 2. DESKTOP QUICK ACTIONS */}
                        <div style={dashboardStyles.desktopQuickActionsCard}>
                            <DesktopQuickActionButton icon={FaDollarSign} label="Deposit" color={GREEN_PRIMARY} path="/deposit" />
                            <DesktopQuickActionButton icon={FaWallet} label="Withdraw" color={RED_WITHDRAW} path="/withdraw" />
                            <DesktopQuickActionButton icon={FaHistory} label="History" color={BLUE_HISTORY} path="/history" />
                            <DesktopQuickActionButton icon={FaUsers} label="plan profit" color={GREEN_LIGHT} path="/profit" />
                        </div>

                        {/* 3. INVESTMENT PLANS */}
                        <h2 style={dashboardStyles.plansHeader}>Investment Plans</h2>
                        <p style={dashboardStyles.plansSubtitle}>
                            Choose the plan that suits your investment goals.
                        </p>

                        <div style={dashboardStyles.plansGrid}>
                            {plans.map((plan) => (
                                <PlanCard 
                                    key={plan.id} 
                                    plan={plan} 
                                    onInvestSuccess={fetchAllData} 
                                    isMobile={isMobile}
                                />
                            ))}
                        </div>

                        {plans.length === 0 && (
                            <div style={dashboardStyles.messageStyle}>
                                No investment plans available at the moment.
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

export default Dashboard;
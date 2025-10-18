import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// We explicitly accept userData from the parent component (Dashboard)
// to ensure the username is dynamic.
function InvestmentPage({ userData }) { 
  const navigate = useNavigate();
  // We don't need to use useState for userData if it's passed via props, 
  // but we'll keep the destructuring simple.
  const [activeTab, setActiveTab] = useState('invest');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Set authLoading to false and handle immediate token check, 
  // relying on the parent for data passing.
  const authLoading = false; 

  // Real-time responsiveness and token check cleanup
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Auth Check: Redirect if token is missing (Assuming Dashboard route enforced this)
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]); // Only dependent on navigate

  const isMobile = windowWidth <= 768;

  // Investment Plans Data (Kept the same)
  const investmentPlans = [
    {
      id: 1,
      name: "10 Marla",
      investment: 3000,
      dailyProfit: 50,
      monthlyProfit: 1500,
      annualProfit: 18250,
      duration: "Lifetime",
      features: ["Daily Profit", "24/7 Support", "Secure Investment", "Flexible Withdrawal"],
      color: "#8B5CF6",
      icon: "🏡"
    },
    {
      id: 2,
      name: "20 Marla", 
      investment: 5000,
      dailyProfit: 100,
      monthlyProfit: 3000,
      annualProfit: 36500,
      duration: "Lifetime",
      features: ["Higher Returns", "Priority Support", "Secure Investment", "Flexible Withdrawal"],
      color: "#06b6d4",
      icon: "🏘️"
    },
    {
      id: 3,
      name: "1 Kanal",
      investment: 8000,
      dailyProfit: 150,
      monthlyProfit: 4500,
      annualProfit: 54750,
      duration: "Lifetime",
      features: ["Premium Returns", "VIP Support", "Secure Investment", "Instant Withdrawal"],
      color: "#10b981", 
      icon: "🏢"
    },
    {
      id: 4,
      name: "10 Kanal",
      investment: 10000,
      dailyProfit: 200,
      monthlyProfit: 6000,
      annualProfit: 73000,
      duration: "Lifetime",
      features: ["Maximum Returns", "Dedicated Manager", "Secure Investment", "Instant Withdrawal"],
      color: "#f59e0b",
      icon: "🏰"
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleInvestNow = (plan) => {
    setSelectedPlan(plan);
    console.log('Selected plan:', plan);
  };

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

  // --- STYLES (All styles definitions are the same) ---
  const styles = {
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
      maxWidth: '1200px',
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
    statsSection: {
      background: FORM_CARD_BG,
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      border: `1px solid ${TEXT_DARK_GRAY}30`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.6s ease-out 0.2s both'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: '1rem',
      textAlign: 'center'
    },
    statCard: {
      padding: '1.5rem 1rem',
      background: 'rgba(139, 92, 246, 0.1)',
      border: `1px solid ${PURPLE_PRIMARY}30`,
      borderRadius: '16px',
      transition: 'all 0.3s ease'
    },
    statIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: TEXT_LIGHT,
      marginBottom: '0.25rem'
    },
    statLabel: {
      fontSize: '0.85rem',
      color: TEXT_GRAY,
      fontWeight: '500'
    },
    plansSection: {
      marginBottom: '2rem',
      animation: 'slideUp 0.6s ease-out 0.4s both'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: TEXT_LIGHT,
      marginBottom: '1.5rem',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '1.5rem'
    },
    planCard: {
      background: FORM_CARD_BG,
      borderRadius: '20px',
      padding: '2rem',
      border: `1px solid ${TEXT_DARK_GRAY}30`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    planCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      borderColor: PURPLE_PRIMARY
    },
    planHeader: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      position: 'relative'
    },
    planIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: TEXT_LIGHT,
      marginBottom: '0.5rem'
    },
    planDuration: {
      fontSize: '0.9rem',
      color: TEXT_GRAY,
      background: 'rgba(139, 92, 246, 0.1)',
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      display: 'inline-block'
    },
    investmentSection: {
      background: 'rgba(139, 92, 246, 0.05)',
      border: `1px solid ${PURPLE_PRIMARY}20`,
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    investmentAmount: {
      fontSize: '2rem',
      fontWeight: '800',
      color: PURPLE_LIGHT,
      marginBottom: '0.5rem'
    },
    investmentLabel: {
      fontSize: '0.9rem',
      color: TEXT_GRAY,
      fontWeight: '500'
    },
    profitGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    profitCard: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: `1px solid ${SUCCESS_GREEN}30`,
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center'
    },
    profitAmount: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: SUCCESS_GREEN,
      marginBottom: '0.25rem'
    },
    profitLabel: {
      fontSize: '0.8rem',
      color: TEXT_GRAY
    },
    featuresList: {
      marginBottom: '1.5rem'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      color: TEXT_LIGHT
    },
    featureIcon: {
      color: SUCCESS_GREEN,
      fontSize: '0.8rem'
    },
    investButton: {
      background: `linear-gradient(135deg, ${PURPLE_PRIMARY} 0%, ${PURPLE_DARK} 100%)`,
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    },
    investButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${PURPLE_PRIMARY}40`
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
  // End of Styles

  // Navigation handler
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/dashboard');
    } else if (tab === 'deposit') {
      navigate('/deposit');
    } else if (tab === 'team') {
      navigate('/team');
    } else if (tab === 'profile') {
      navigate('/profile');
    }
  };

  const [hoveredPlan, setHoveredPlan] = useState(null);

  if (authLoading) { // This will now always be false
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={{color: TEXT_GRAY, fontSize: '16px', fontWeight: '500'}}>
          Loading...
        </div>
      </div>
    );
  }

  // Determine the display name using the PROP
  const displayName = userData 
    ? (userData.first_name || userData.username || 'User') 
    : 'User';

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

      {/* Header - Now using the userData PROP for the name */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.welcomeText}>As-salamu alaykum,</div>
          <div style={styles.userName}>
            {displayName}
          </div>
        </div>
        <div 
          style={styles.notificationBtn}
          onClick={handleLogout}
        >
          <span>🚪</span>
        </div>
      </div>

      {/* Main Content (Rest of the component is the same) */}
      <div style={styles.mainContent}>
        <h1 style={styles.pageTitle}>Investment Plans</h1>
        <p style={styles.pageSubtitle}>Choose your plot-based investment plan and start earning daily profits</p>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>💰</div>
              <div style={styles.statValue}>4</div>
              <div style={styles.statLabel}>Plans Available</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📈</div>
              <div style={styles.statValue}>Lifetime</div>
              <div style={styles.statLabel}>Duration</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🔄</div>
              <div style={styles.statValue}>Daily</div>
              <div style={styles.statLabel}>Profit Payment</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⚡</div>
              <div style={styles.statValue}>Instant</div>
              <div style={styles.statLabel}>Withdrawal</div>
            </div>
          </div>
        </div>

        {/* Investment Plans */}
        <div style={styles.plansSection}>
          <div style={styles.sectionTitle}>
            <span>🏗️</span> Available Plot Plans
          </div>

          <div style={styles.plansGrid}>
            {investmentPlans.map((plan) => (
              <div 
                key={plan.id}
                style={
                  hoveredPlan === plan.id 
                    ? { ...styles.planCard, ...styles.planCardHover }
                    : styles.planCard
                }
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Plan Header */}
                <div style={styles.planHeader}>
                  <div style={styles.planIcon}>{plan.icon}</div>
                  <div style={styles.planName}>{plan.name}</div>
                  <div style={styles.planDuration}>{plan.duration}</div>
                </div>

                {/* Investment Amount */}
                <div style={styles.investmentSection}>
                  <div style={styles.investmentAmount}>₨{plan.investment.toLocaleString()}</div>
                  <div style={styles.investmentLabel}>Investment Amount</div>
                </div>

                {/* Profit Details */}
                <div style={styles.profitGrid}>
                  <div style={styles.profitCard}>
                    <div style={styles.profitAmount}>₨{plan.dailyProfit}/day</div>
                    <div style={styles.profitLabel}>Daily Profit</div>
                  </div>
                  <div style={styles.profitCard}>
                    <div style={styles.profitAmount}>₨{plan.monthlyProfit.toLocaleString()}/mo</div>
                    <div style={styles.profitLabel}>Monthly</div>
                  </div>
                </div>

                {/* Annual Profit */}
                <div style={{
                  ...styles.profitCard,
                  gridColumn: '1 / -1',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${WARNING_AMBER}30`
                }}>
                  <div style={{...styles.profitAmount, color: WARNING_AMBER}}>
                    ₨{plan.annualProfit.toLocaleString()}/year
                  </div>
                  <div style={styles.profitLabel}>Annual Profit</div>
                </div>

                {/* Features */}
                <div style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={styles.featureItem}>
                      <span style={styles.featureIcon}>✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Invest Button */}
                <button
                  style={styles.investButton}
                  onClick={() => handleInvestNow(plan)}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.investButtonHover)}
                  onMouseLeave={(e) => Object.assign(e.target.style, { 
                    transform: 'translateY(0)', 
                    boxShadow: 'none' 
                  })}
                >
                  Invest in {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'invest', icon: '💼', label: 'Invest' },
          { id: 'deposit', icon: '💰', label: 'Deposit' },
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

export default InvestmentPage;
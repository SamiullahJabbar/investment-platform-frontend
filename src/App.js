import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import DepositPage from './pages/DepositPage';
import Invest from './pages/Invest';
import Team from './pages/Team';
import DepositHistoryPage from './pages/DepositHistoryPage';
import PlanHistory from './pages/PlanHistory';
import Withdrew from './pages/Withdrew';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/Deposit" element={<DepositPage />} />
        <Route path="/Invest" element={<Invest />} />
        <Route path="/Team" element={<Team />} />
        <Route path="/DepositHistory" element={<DepositHistoryPage />} />
        <Route path="/PlanHistory" element={<PlanHistory />} />
        <Route path="/withdraw" element={<Withdrew />} />
        
      </Routes>
    </Router>
  );
}

export default App;

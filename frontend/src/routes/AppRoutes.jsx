import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import PrivateRoute from './PrivateRoute';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Main
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Accounts from '../pages/Accounts';
import Categories from '../pages/Categories';
import Budgets from '../pages/Budgets';
import Goals from '../pages/Goals';
import Investments from '../pages/Investments';
import Stocks from '../pages/Stocks';
import StockDetail from '../pages/StockDetail';
import Analytics from '../pages/Analytics';
import Anomalies from '../pages/Anomalies';
import AiAssistant from '../pages/AiAssistant';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';


// change
import AiAdvisor from '../pages/AiAdvisor';

//change
// import Analytics from '../pages/Analytics';
// import Anomalies from '../pages/Anomalies';
// import Notifications from '../pages/Notifications';
// import Settings from '../pages/Settings';
// import AiAdvisor from '../pages/AiAdvisor';


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/transactions"  element={<Transactions />} />
          <Route path="/accounts"      element={<Accounts />} />
          <Route path="/categories"    element={<Categories />} />
          <Route path="/budgets"       element={<Budgets />} />
          <Route path="/goals"         element={<Goals />} />
          <Route path="/investments"   element={<Investments />} />
          <Route path="/stocks"        element={<Stocks />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
          <Route path="/analytics"     element={<Analytics />} />
          <Route path="/anomalies"     element={<Anomalies />} />
          <Route path="/ai-assistant"  element={<AiAssistant />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings"      element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />

      //change
      <Route path="/ai-advisor" element={<AiAdvisor />} />

      //change

<Route path="/analytics"     element={<Analytics />} />
<Route path="/anomalies"     element={<Anomalies />} />
<Route path="/notifications" element={<Notifications />} />
<Route path="/settings"      element={<Settings />} />
<Route path="/ai-advisor"    element={<AiAdvisor />} />
    </Routes>
  );
}
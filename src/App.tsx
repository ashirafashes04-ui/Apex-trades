import React from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Header } from './components/layout/Header';
import { SideMenu } from './components/layout/SideMenu';
import { MarketSelectorModal } from './components/trade/MarketSelectorModal';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { ToastContainer } from './components/layout/ToastContainer';

import { TradePage } from './pages/TradePage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { HistoryPage } from './pages/HistoryPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReferralsPage } from './pages/ReferralsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { AuthPages } from './pages/AuthPages';
import { AdminPage } from './pages/AdminPage';

const MainContent: React.FC = () => {
  const { currentRoute } = useTrading();

  const renderPage = () => {
    switch (currentRoute) {
      case 'trade':
        return <TradePage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'markets':
        return <MarketsPage />;
      case 'history':
        return <HistoryPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'deposit':
        return <DepositPage />;
      case 'withdraw':
        return <WithdrawPage />;
      case 'profile':
        return <ProfilePage />;
      case 'referrals':
        return <ReferralsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      case 'admin':
        return <AdminPage />;
      case 'login':
      case 'signup':
        return <AuthPages />;
      default:
        return <TradePage />;
    }
  };

  const isAuthPage = currentRoute === 'login' || currentRoute === 'signup';

  return (
    <div className="min-h-screen bg-[#0D0F10] text-[#F4F4F5] flex flex-col font-sans antialiased pb-6">
      {/* Top Header */}
      {!isAuthPage && <Header />}

      {/* Main View Area */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Global Overlays & Modals */}
      <SideMenu />
      <MarketSelectorModal />
      <QuickActionModal />
      <AIAssistantDrawer />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <MainContent />
    </TradingProvider>
  );
}

import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from '@reown/appkit/react';
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useMemo, useState, useEffect, useCallback } from "react";
import BuyForm from "./BuyForm";
import TransactionHistory from "./TransactionHistory";
import SwitchNetworkButton from "./SwitchNetworkButton";
import StatCard from "./StatCard";
import useCurrentChain from "../hooks/useCurrentChain";
import { useActiveStage } from "../hooks/useActiveStage";
import config from "../config";
import HeroSection from "../components/HeroSection";

import {
  WalletIcon,
  GiftIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const chain = useCurrentChain();
  const balances = useSelector((state: RootState) => state.wallet.balances);
  const multiChainBalances = useSelector((state: RootState) => state.wallet.multiChainSaleTokenBalances);
  const totalTokensSold = useSelector((state: RootState) => state.presale.totalTokensSold);
  const { data: stageData } = useActiveStage();
  const [myBonus, setMyBonus] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoize values to prevent unnecessary re-renders
  const saleToken = useMemo(() => config.saleToken[chain.id], [chain.id]);
  const myBalance = useMemo(() => {
    // Sum balance across all chains
    return Object.values(multiChainBalances).reduce((sum, balance) => sum + balance, 0);
  }, [multiChainBalances]);
  const tokensSold = useMemo(() => totalTokensSold || 0, [totalTokensSold]);
  const stageStartTime = useMemo(() => stageData?.stage?.startTime || null, [stageData?.stage?.startTime]);

  // Fetch user's total bonus from transactions
  const fetchUserBonus = useCallback(async () => {
    if (!address) {
      setMyBonus(0);
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://psmanager.vaultcoin.network/';
      const apiKey = import.meta.env.VITE_API_KEY || 'r5vtiwM+cGphTvXffy2jFkyKjmEPLeXsOjvEiAQM54A=';

      const response = await fetch(`${backendUrl}/api/widget/transactions/${address}`, {
        headers: {
          'x-api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        const transactions = data.transactions || [];

        // Sum up all bonus tokens from completed transactions
        const totalBonus = transactions.reduce((sum: number, tx: any) => {
          return sum + parseFloat(tx.bonusTokens || 0);
        }, 0);

        setMyBonus(totalBonus);
      }
    } catch (error) {
      console.error('Failed to fetch bonus:', error);
    }
  }, [address]);

  // Fetch bonus on mount and when address changes
  useEffect(() => {
    fetchUserBonus();
  }, [fetchUserBonus, refreshKey]);

  // Function to refresh data after purchase
  const handlePurchaseComplete = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="mx-auto w-full max-w-full pb-6 lg:pb-8">
      {/* Main Dashboard Grid */}
      {isConnected ? (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-4 mt-20 lg:mt-32 justify-center lg:max-w-6xl px-4 mx-auto">
          
          
          {/* Presale Form - Second on mobile, Right side on desktop */}
          <div className="order-0 lg:col-span-5 lg:order-2">
            <div className="lg:sticky lg:top-6">
              <BuyForm onPurchaseComplete={handlePurchaseComplete} />
            </div>
          </div>      
          {/* Stats Cards - Mobile Only - After form and transactions */}
          <div className="lg:hidden">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="My Balance"
                value={`${myBalance.toLocaleString()} VLTC`}
                Icon={WalletIcon}
                gradient="bg-gradient-to-br from-brandStart to-brandEnd"
              />
              <StatCard
                label="My Bonus"
                value={`+${myBonus.toLocaleString()} VLTC`}
                Icon={GiftIcon}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
            </div>    
          </div>

          {/* Transaction History - Third on mobile, Left side on desktop */}
          <div className="order-2 lg:col-span-7 lg:order-1">
            {/* Top Stats Cards - Desktop Only */}
            <div className="hidden lg:grid grid-cols-2 gap-4 mb-4">
              <StatCard
                key="balance-card"
                label="My Balance"
                value={`${myBalance.toLocaleString()} VLTC`}
                Icon={WalletIcon}
                gradient="bg-gradient-to-br from-brandStart to-brandEnd"
              />
              <StatCard
                key="bonus-card"
                label="My Bonus"
                value={`+${myBonus.toLocaleString()} VLTC`}
                Icon={GiftIcon}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
            </div>
            <TransactionHistory refreshKey={refreshKey} />
          </div>
        </div>
        
        </>
      ) : (
        // <div className="flex items-center justify-center">
        //   <div className="w-full">
        <div>
            <HeroSection onPurchaseComplete={handlePurchaseComplete}/>
        </div>
        // </div>
      )}
    </div>
  );
};

export default Dashboard;
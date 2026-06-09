import { useState, useEffect } from 'react';
import axios from 'axios';

interface ActiveStageData {
  stage: {
    id: number;
    name: string;
    tokenPrice: string;
    tokensSold: string;
    totalRaised: string;
    startTime: string | null;
    durationSeconds: number;
    timeRemaining: number | null;
    progressPercentage: number;
    endTime: string | null;
    status: string;
    isLastStage?: boolean;
  } | null;
  stats: {
    totalRaised: string;
    totalTokensSold: string;
  };
  isLastStage?: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://psmanager.vaultcoin.network/';
const API_KEY = import.meta.env.VITE_API_KEY || 'r5vtiwM+cGphTvXffy2jFkyKjmEPLeXsOjvEiAQM54A=';

// Cache duration: 5 minutes (enough to detect stage transitions but not excessive)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useActiveStage(refreshInterval = CACHE_DURATION) {
  const [data, setData] = useState<ActiveStageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientTimeRemaining, setClientTimeRemaining] = useState<number | null>(null);
  const [hasRefetchedOnEnd, setHasRefetchedOnEnd] = useState(false);

  const fetchActiveStage = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/widget/active-stage`, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      setData(response.data);
      setError(null);
      // Reset refetch flag when new data arrives
      setHasRefetchedOnEnd(false);
    } catch (err: any) {
      console.error('Failed to fetch active stage:', err);
      setError(err.message || 'Failed to fetch active stage');
      // If no active stage found (404), set data to null to stop countdown
      if (err.response?.status === 404) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side countdown timer that updates every second
  useEffect(() => {
    if (!data?.stage?.endTime) {
      setClientTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const endTime = new Date(data.stage!.endTime!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setClientTimeRemaining(remaining);

      // If time is up, refetch ONCE to check for next stage
      // Don't keep refetching every second if there's no next stage
      if (remaining === 0 && !hasRefetchedOnEnd) {
        setHasRefetchedOnEnd(true);
        fetchActiveStage();
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second for smooth countdown
    const countdownInterval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(countdownInterval);
  }, [data?.stage?.endTime]);

  // Fetch stage data periodically (every 5 minutes by default)
  useEffect(() => {
    fetchActiveStage();

    // Set up polling to refresh data (detect stage changes, token sales updates)
    const interval = setInterval(fetchActiveStage, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchActiveStage,
    clientTimeRemaining // Smooth client-side countdown
  };
}

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import config from "../config";
import { useAccount, useSwitchChain, useDisconnect } from "wagmi";
import useWeb3Functions from "../hooks/useWeb3Functions";
import { useActiveStage } from "../hooks/useActiveStage";
import Loading from "./Loading";
import { setCurrentChain } from "../store/presale";
import { useTranslation } from "react-i18next";
import Countdown, { CountdownRenderProps, zeroPad } from "react-countdown";
import { formatNumber } from "../utils";
import useCurrentChain from "../hooks/useCurrentChain";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { BuyWithCardModal } from "./BuyWithCardModal";
import { ConnectWalletModal } from "./ConnectWalletModal";
import SwitchNetworkButton from "./SwitchNetworkButton";
import { CurrencyDollarIcon, WalletIcon } from '@heroicons/react/24/outline';
import { parseUnits, formatUnits } from "viem";
import "../buyform.css";

const MySwal = withReactContent(Swal);

interface BuyFormProps {
  onPurchaseComplete?: () => void;
}

const BuyForm = ({ onPurchaseComplete }: BuyFormProps) => {
  const { t } = useTranslation();
  const chain = useCurrentChain();
  const { switchChainAsync } = useSwitchChain();
  const dispatch = useDispatch();
  const { data: stageData, loading: stageLoading, clientTimeRemaining } = useActiveStage();

  // Check if the sale is over (no active stage and last stage concluded)
  const isSaleOver = !stageLoading && stageData?.stage?.timeRemaining == 0;
  const {
    buyToken,
    fetchIntialData,
    fetchLockedBalance,
    fetchAllChainBalances,
    fetchTokenBalances,
    loading,
    getPriceInUSD,
    presaleContract,
  } = useWeb3Functions();
  const tokens = useSelector((state: RootState) => state.presale.tokens);
  const balances = useSelector((state: RootState) => state.wallet.balances);
  const multiChainBalances = useSelector((state: RootState) => state.wallet.multiChainSaleTokenBalances);
  const tokenPrices = useSelector((state: RootState) => state.presale.prices);
  const saleStatus = useSelector(
    (state: RootState) => state.presale.saleStatus
  );

  const minBuyLimit = useSelector((state: RootState) => state.presale.minBuyLimit) + 1;
  const maxBuyLimit = useSelector((state: RootState) => state.presale.maxBuyLimit);

  const tokenBalance = useSelector((state: RootState) => state.wallet.balances);
  const saleToken = config.saleToken;

  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] =
    useState(false);
  const [isBuyWithCardModalOpen, setIsBuyWithCardModalOpen] = useState(false);

  const [fromToken, setFromToken] = useState<Token>(tokens[chain.id][0]);
  const toToken = useMemo(() => saleToken[chain.id] as Token, [chain]);

  const [fromValue, setFromValue] = useState<string | number>("");
  const [toValue, setToValue] = useState<string | number>("");
  const [bonusCode, setBonusCode] = useState<string>("");
  const [bonusInfo, setBonusInfo] = useState<{
    valid: boolean;
    percentage: number;
    message: string;
    minPurchaseAmount: number | null;
    maxPurchaseAmount: number | null;
  } | null>(null);
  const [checkingBonus, setCheckingBonus] = useState(false);
  const [priceInUSD, setPriceInUSD] = useState<bigint>(0n);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Check for widget mode via query parameter
  const isWidgetMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('widget') === 'true';
  }, []);

  // Progress selectors (unchanged)
  const totalTokensSold = useSelector(
    (s: RootState) => s.presale.totalTokensSold
  );
  const totalTokensForSale = config.stage.total;

  const soldPercentage = useMemo(() => {
    if (!totalTokensForSale) return 0;
    const pct = (totalTokensSold / totalTokensForSale) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [totalTokensSold, totalTokensForSale]);

  const fmt = (n: number | string | undefined) =>
    Number(n || 0).toLocaleString();

  const fixedNumber = (num: number, decimals = 6) =>
    +parseFloat((+num).toFixed(decimals));

  const lockedToken = useMemo(
    () => formatNumber(balances[toToken.symbol]),
    [balances]
  );

  const totalMultiChainBalance = useMemo(() => {
    const total = Object.values(multiChainBalances).reduce((sum, balance) => sum + balance, 0);
    return total;
  }, [multiChainBalances]);

  const buttonTitle = useMemo(() => {
    if (!isConnected) return t("connect-wallet");
    if (saleStatus) return "BUY NOW";
    return "Unlock Tokens";
  }, [isConnected, saleStatus]);

  const insufficientBalance = useMemo(() => {
    if (!fromValue) return false;
    return +fromValue > tokenBalance[fromToken.symbol];
  }, [fromValue, tokenBalance]);

  // Calculate USD value of purchase for min/max validation
  // This should match the contract calculation: (saleTokenAmt * priceInUSD) / 10^18
  const purchaseUSD = useMemo(() => {
    if (!toValue || !priceInUSD || priceInUSD === 0n) return 0;

    // Convert toValue to BigInt with 18 decimals
    const saleTokenAmt = parseUnits(toValue.toString(), 18);

    // Calculate USD value: (saleTokenAmt * priceInUSD) / 10^18
    const usdValue = (saleTokenAmt * priceInUSD) / BigInt(10 ** 18);

    // Convert back to number
    return +formatUnits(usdValue, 18);
  }, [toValue, priceInUSD]);

  const belowMinLimit = useMemo(() => {
    if (!fromValue || !minBuyLimit) return false;
    // Round to 2 decimal places to match USD precision and avoid floating point issues
    const roundedPurchaseUSD = Math.round(purchaseUSD * 100) / 100;
    return roundedPurchaseUSD < minBuyLimit;
  }, [fromValue, purchaseUSD, minBuyLimit]);

  const aboveMaxLimit = useMemo(() => {
    if (!fromValue || !maxBuyLimit) return false;
    // Round to 2 decimal places to match USD precision and avoid floating point issues
    const roundedPurchaseUSD = Math.round(purchaseUSD * 100) / 100;
    return roundedPurchaseUSD > maxBuyLimit;
  }, [fromValue, purchaseUSD, maxBuyLimit]);

  // Check if purchase amount is outside bonus code limits
  const bonusCodePurchaseLimitError = useMemo(() => {
    if (!bonusInfo?.valid || !purchaseUSD) return null;

    const roundedPurchaseUSD = Math.round(purchaseUSD * 100) / 100;

    if (bonusInfo.minPurchaseAmount !== null && roundedPurchaseUSD < bonusInfo.minPurchaseAmount) {
      return {
        type: 'below_min' as const,
        message: `Minimum purchase for this bonus code is $${bonusInfo.minPurchaseAmount.toLocaleString()}`,
        required: bonusInfo.minPurchaseAmount,
        current: roundedPurchaseUSD,
      };
    }

    if (bonusInfo.maxPurchaseAmount !== null && roundedPurchaseUSD > bonusInfo.maxPurchaseAmount) {
      return {
        type: 'above_max' as const,
        message: `Maximum purchase for this bonus code is $${bonusInfo.maxPurchaseAmount.toLocaleString()}`,
        required: bonusInfo.maxPurchaseAmount,
        current: roundedPurchaseUSD,
      };
    }

    return null;
  }, [bonusInfo, purchaseUSD]);

  const setBalance = () => {
    const balance = balances[fromToken.symbol];
    setFromValue(balance);

    if (tokenPrices[fromToken.symbol] !== 0) {
      setToValue(fixedNumber(balance / tokenPrices[fromToken.symbol], 4));
    }
  };

  const checkBonusCode = async (currentPurchaseUSD?: number) => {
    if (!bonusCode.trim()) {
      setBonusInfo(null);
      return;
    }

    setCheckingBonus(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://psmanager.vaultcoin.network/';
      const apiKey = import.meta.env.VITE_API_KEY || 'r5vtiwM+cGphTvXffy2jFkyKjmEPLeXsOjvEiAQM54A=';
      const activeStageId = stageData?.stage?.id;
      const amountToCheck = currentPurchaseUSD ?? purchaseUSD;

      let url = `${backendUrl}/api/widget/validate-bonus?code=${bonusCode.toUpperCase()}`;
      if (activeStageId) url += `&stageId=${activeStageId}`;
      if (amountToCheck > 0) url += `&purchaseAmount=${amountToCheck}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': apiKey },
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setBonusInfo({
          valid: true,
          percentage: data.percentage,
          message: `Valid! You'll get +${data.percentage}% bonus tokens`,
          minPurchaseAmount: data.minPurchaseAmount ?? null,
          maxPurchaseAmount: data.maxPurchaseAmount ?? null,
        });
      } else {
        setBonusInfo({
          valid: false,
          percentage: 0,
          message: data.message || 'Invalid or expired bonus code',
          minPurchaseAmount: null,
          maxPurchaseAmount: null,
        });
      }
    } catch (error) {
      setBonusInfo({
        valid: false,
        percentage: 0,
        message: 'Failed to validate bonus code',
        minPurchaseAmount: null,
        maxPurchaseAmount: null,
      });
    } finally {
      setCheckingBonus(false);
    }
  };

  const fromValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      emptyValues();
      return;
    }

    setFromValue(fixedNumber(+value));
    if (tokenPrices[fromToken.symbol] !== 0) {
      setToValue(fixedNumber(+value / tokenPrices[fromToken.symbol], 4));
    }
  };

  const toValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      emptyValues();
      return;
    }

    setToValue(fixedNumber(+value, 4));
    if (tokenPrices[fromToken.symbol] !== 0) {
      setFromValue(fixedNumber(+value * tokenPrices[fromToken.symbol]));
    }
  };

  const emptyValues = () => {
    setFromValue("");
    setToValue("");
  };

  const submit = async (event: any) => {
    event.preventDefault();

    if (!isConnected) return setIsConnectWalletModalOpen(true);
    if (+fromValue === 0) return;

    const result = await buyToken(fromValue, fromToken, bonusCode);

    if (result.success) {
      // Clear bonus code after successful purchase
      setBonusCode("");
      setBonusInfo(null);

      // Trigger refresh in parent Dashboard component
      onPurchaseComplete?.();
    }

    emptyValues();
  };

  // === EFFECTS ===
  useEffect(() => {
    if (!address || !chain) return () => {};
    fetchAllChainBalances();
    fetchTokenBalances();
  }, [address, chain]);

  useEffect(() => {
    if (!chain || !config.chains.find((c) => c.id === chain.id)) return () => {};
    dispatch(setCurrentChain(chain.id));
    setFromToken(tokens[chain.id][0]);
    fetchIntialData();
    emptyValues();
  }, [chain]);

  useEffect(() => {
    if (!isConnected || !chain) return () => {};

    if (config.chains.find((c) => c.id === chain.id)) {
      dispatch(setCurrentChain(chain?.id as number));
    } else {
      switchChainAsync?.({ chainId: config.chains[0].id });
    }
  }, [isConnected]);

  useEffect(() => {
    fetchIntialData();

    // Fetch priceInUSD from contract
    const fetchPrice = async () => {
      const price = await getPriceInUSD();
      setPriceInUSD(price);
    };
    fetchPrice();
  }, []);

  // Refetch priceInUSD when chain changes
  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getPriceInUSD();
      setPriceInUSD(price);
    };
    fetchPrice();
  }, [chain]);

  // Recalculate toValue when payment token changes
  useEffect(() => {
    if (fromValue && tokenPrices[fromToken.symbol] !== 0) {
      setToValue(fixedNumber(+fromValue / tokenPrices[fromToken.symbol], 4));
    }
  }, [fromToken.symbol, tokenPrices]);

  const renderer: React.FC<CountdownRenderProps> = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }) => {
    if (completed) {
      return (
        <div className="mx-auto block rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 px-4 py-3 text-center backdrop-blur-sm">
          <p className="text-lg font-bold text-red-400">Stage Ended!</p>
          <p className="text-xs text-text-muted mt-1">Refreshing...</p>
        </div>
      );
    }

    // Progress helpers (Days uses a 30-day window as a sensible default)
    const items = [
      { label: "Days", value: Number(days), max: 30 },
      { label: "Hours", value: Number(hours), max: 24 },
      { label: "Minutes", value: Number(minutes), max: 60 },
      { label: "Seconds", value: Number(seconds), max: 60 },
    ] as const;

    const pct = (val: number, max: number) =>
      `${Math.max(0, Math.min(100, (val / max) * 100))}%`;

    return (
      <div
        role="timer"
        aria-live="polite"
        className="relative mx-auto overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-bgCard to-bgDark p-4 shadow-xl backdrop-blur-sm"
      >
        <div className="relative flex items-stretch justify-center gap-2">
          {items.map(({ label, value, max }) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center justify-center rounded-lg bg-bgDark/80 px-2 py-3 backdrop-blur-sm border border-border-gray/50"
            >
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                {label}
              </div>

              <div className="select-none tabular-nums text-2xl font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary to-orange-400 lg:text-3xl">
                {zeroPad(value)}
              </div>

              {/* tiny progress pill */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bgCard/50 ring-1 ring-border-dark/30">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: pct(value, max),
                    background: 'linear-gradient(135deg, #ff8800 0%, #ff6600 100%)',
                    boxShadow: '0 0 8px rgba(255, 136, 0, 0.5)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Decorative glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    );
  };
  

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border-gray bg-bgCard shadow-2xl"
    >
      {loading && <Loading className="z-50 rounded-xl" />}

      {/* Header */}
      <div className="flex flex-col items-center justify-center rounded-t-xl px-4 pb-5 pt-6 text-text-light">
        <div className="w-full">
          <div className="text-center text-text-light">
            <p className="mb-1 text-xl font-semibold tracking-wide">
              {stageData?.stage?.name || 'STAGE 1 PRESALE'} ENDED
            </p>
            {/* {stageData?.stage?.tokenPrice && (
              <p className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 font-semibold mt-2">
                1 {toToken?.symbol ?? "TOKEN"} = ${Number(stageData.stage.tokenPrice).toFixed(6)}
              </p>
            )} */}

            {/* Countdown Timer */}
            {clientTimeRemaining !== null && clientTimeRemaining > 0 && stageData?.stage?.endTime && (
              <div className="mt-4">
                {/* <p className="text-xs text-text-muted uppercase tracking-wider mb-2 text-center">
                  Stage Ends In
                </p> */}
                <Countdown
                  date={new Date(stageData.stage.endTime).getTime()}
                  renderer={renderer}
                  onComplete={() => fetchIntialData()}
                />
              </div>
            )}

            {/* Time-based Progress */}
            <div className="mt-3 w-full">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                  Progress
                </span>
                <span className="text-[12px] font-semibold text-primary">
                  {(() => {
                    // Calculate client-side progress percentage
                    if (!stageData?.stage?.durationSeconds || clientTimeRemaining === null) return '0.0';
                    const totalDuration = stageData.stage.durationSeconds;
                    const elapsed = totalDuration - clientTimeRemaining;
                    const progress = (elapsed / totalDuration) * 100;
                    return Math.min(100, Math.max(0, progress)).toFixed(1);
                  })()}%
                </span>
              </div>

              <div
                className="relative h-3 w-full overflow-hidden rounded-full bg-bgDark ring-1 ring-border-dark"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(stageData?.stage?.progressPercentage || 0)}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${(() => {
                      // Calculate client-side progress percentage
                      if (!stageData?.stage?.durationSeconds || clientTimeRemaining === null) return 0;
                      const totalDuration = stageData.stage.durationSeconds;
                      const elapsed = totalDuration - clientTimeRemaining;
                      const progress = (elapsed / totalDuration) * 100;
                      return Math.min(100, Math.max(0, progress));
                    })()}%`,
                    background: 'linear-gradient(135deg, #ff8800 0%, #ff6600 100%)'
                  }}
                />
                {/* shimmer overlay */}
                <div className="progress-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-50" />
              </div>

              {/* <div className="mt-2 text-center text-xs text-text-gray">
                <span>
                  Ends in: {Math.floor((clientTimeRemaining || 0) / 3600)}h{' '}
                  {Math.floor(((clientTimeRemaining || 0) % 3600) / 60)}m{' '}
                  {(clientTimeRemaining || 0) % 60}s
                </span>
              </div> */}
            </div>

            {/* My Balance Section - shown when connected and in widget mode */}
            {isWidgetMode && isConnected && totalMultiChainBalance > 0 && false && (
              <div className="mt-4 mx-auto w-[92%]">
                <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-bgCard/80 to-bgDark/80 p-4 backdrop-blur-sm">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500">
                          <CurrencyDollarIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                          My Balance
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                          {formatNumber(totalMultiChainBalance)}
                        </p>
                        <p className="text-xs text-text-gray font-medium">
                          {toToken?.symbol || 'VLTC'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute -right-10 -top-10 h-24 w-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                </div>
              </div>
            )}
            {isWidgetMode && stageData?.stats?.totalRaised &&(
              <p className="mt-4 w-full text-center text-2xl font-bold text-text-light">
                Total Raised: ${Number(stageData.stats.totalRaised).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>             
            )}
          </div>
        </div>
      </div>
      {/* Hiding other options in Widget */}
     
      {/* Form */}
      {!isWidgetMode && (
      <form onSubmit={submit} className="px-4 pb-5 pt-1">
        {stageData?.stats?.totalRaised && (
          <p className="mb-2 w-full text-center text-xl font-bold text-text-light">
            Total Raised: ${Number(stageData.stats.totalRaised).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
        <p className="relative mb-3 w-full text-center text-sm font-bold tracking-wider">
          <span className="inline-block px-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">
            1 {toToken?.symbol ?? "TOKEN"} = ${stageData?.stage?.tokenPrice ? Number(stageData.stage.tokenPrice).toFixed(6) : '0.00031'}
          </span>
          <span className="separator-line before" />
          <span className="separator-line after" />
        </p>

        {/* Wallet Info - After Second Price Line */}
        {isConnected && (
          <>
          <div className="hidden lg:flex mb-4 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                <WalletIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase tracking-wide">Connected Wallet</span>
                <span className="text-xs font-mono font-bold text-text-light">
                  {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SwitchNetworkButton />
              <button
                type="button"
                onClick={() => disconnect()}
                className="px-3 py-1.5 rounded-lg bg-red-600 border border-red-700 text-white hover:bg-red-700 transition-all font-semibold text-xs"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="lg:hidden mb-4 p-3 rounded-lg bg-bgDark/50 border border-border-gray">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0">
                  <WalletIcon className="w-4 h-4 text-white" />
                </div> */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Wallet</p>
                  <p className="text-xs font-mono font-bold text-text-light truncate">
                    {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                  </p>
                </div>
              </div>
              <SwitchNetworkButton />
              <button
                type="button"
                onClick={() => disconnect()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 border border-red-700 text-white hover:bg-red-700 transition-all font-semibold text-xs whitespace-nowrap flex-shrink-0"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {/* <span>Disconnect</span> */}
              </button>
            </div>
          </div>
          </>
        )}

        {/* Sale Over Message */}
        {isSaleOver && (
          <div className="my-6">
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 bg-gradient-to-br from-bgCard to-bgDark p-8 text-center backdrop-blur-sm shadow-2xl">
              <div className="relative z-10 space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-500 shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-text-light">
                    Presale Has Ended
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    The token sale has successfully concluded. Thank you for your participation!
                  </p>              

                  {/* {stageData?.stats?.totalRaised && (
                    <div className="mt-4 inline-block rounded-lg bg-bgDark/60 border border-border-gray px-4 py-2">
                      <p className="text-xs text-text-gray uppercase tracking-wide">Final Total Raised</p>
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                        ${Number(stageData.stats.totalRaised).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
              {/* Decorative glow effects */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>
            {!isConnected && (
            <button
              type="button"
              onClick={() => setIsConnectWalletModalOpen(true)}
              className="btn-primary btn-sheen w-full mt-6"
            >
              {t("connect-wallet")}
            </button>
            )}
          </div>
        )}        

        {!isSaleOver && saleStatus && (
          <>
            {isConnected ? (
              <>
                {/* Mobile Wallet Info - Inside Form */}
                <div className="lg:hidden mb-4 p-3 rounded-lg bg-bgDark/50 border border-border-gray">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0">
                        <WalletIcon className="w-4 h-4 text-white" />
                      </div> */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Wallet</p>
                        <p className="text-xs font-mono font-bold text-text-light truncate">
                          {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
                        </p>
                      </div>
                    </div>
                    <SwitchNetworkButton />
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 border border-red-700 text-white hover:bg-red-700 transition-all font-semibold text-xs whitespace-nowrap flex-shrink-0"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {/* <span>Disconnect</span> */}
                    </button>
                  </div>
                </div>

                {/* Token selector */}
                <div className="grid grid-cols-3 gap-2">
                  {tokens[chain.id].map((token) => (
                    <button
                      key={token.symbol}
                      type="button"
                      className={`token-pill group ${
                        fromToken.symbol === token.symbol
                          ? "token-pill--active"
                          : ""
                      }`}
                      onClick={() => setFromToken(token)}
                    >
                      <img
                        src={token.image}
                        alt={token.symbol}
                        className="h-5 w-5 object-contain transition-transform group-hover:scale-110"
                      />
                      <span className="text-sm font-bold">{token.symbol}</span>
                    </button>
                  ))}
                </div>

                {/* Min/Max Buy Limits Info */}
                {minBuyLimit > 0 && maxBuyLimit > 0 && (
                  <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CurrencyDollarIcon className="w-4 h-4 text-primary" />
                        <span className="text-text-gray font-medium">Min:</span>
                        <span className="text-text-light font-bold">${minBuyLimit.toLocaleString()}</span>
                      </div>
                      <div className="h-3 w-px bg-border-gray"></div>
                      <div className="flex items-center gap-1.5">
                        <CurrencyDollarIcon className="w-4 h-4 text-primary" />
                        <span className="text-text-gray font-medium">Max:</span>
                        <span className="text-text-light font-bold">${maxBuyLimit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 mb-2">
                  <div className="pb-2 text-center">
                    <p className="relative mx-2 text-center text-sm font-semibold tracking-[1.5px] text-text-light">
                      {`${fromToken.symbol} balance ${formatNumber(
                        balances[fromToken.symbol]
                      )}`}
                    </p>
                  </div>

                  {/* Inputs */}
                  <div className="mt-2">
                    <div className="my-2 grid gap-4 lg:grid-cols-2">
                      {/* From */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="truncate text-xs tracking-[1px] text-text-gray">
                            {fromToken.symbol} {t("you-pay")}
                          </label>
                          <span
                            className="cursor-pointer text-xs font-bold text-primary underline-offset-4 hover:underline"
                            onClick={() => setBalance()}
                          >
                            Max
                          </span>
                        </div>
                        <div className="relative flex items-start">
                          <input
                            className={`neumorph-input ${insufficientBalance ? "danger" : ""}`}
                            type="number"
                            min={0}
                            step={0.00001}
                            placeholder="0"
                            value={fromValue}
                            onChange={fromValueChange}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <img
                              src={fromToken.image}
                              alt={fromToken.name}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      {/* To */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="truncate text-xs tracking-[1px] text-text-gray">
                            {toToken.symbol} {t("you-receive")}
                          </label>
                        </div>
                        <div className="relative flex items-start">
                          <input
                            className={`neumorph-input ${insufficientBalance ? "danger" : ""}`}
                            type="number"
                            min={0}
                            step={0.00001}
                            placeholder="0"
                            value={toValue}
                            onChange={toValueChange}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <img
                              src={toToken.image}
                              alt={toToken.name}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bonus Code Field */}
                    <div className="mt-4 space-y-3">
                      <label className="truncate text-xs tracking-[1px] text-text-gray font-semibold uppercase">
                        🎁 Bonus Code (Optional)
                      </label>
                      <div className="relative">
                        <input
                          className="neumorph-input font-mono uppercase w-full pr-28"
                          type="text"
                          placeholder="ENTER CODE"
                          maxLength={20}
                          value={bonusCode}
                          onChange={(e) => {
                            setBonusCode(e.target.value.toUpperCase());
                            setBonusInfo(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => checkBonusCode()}
                          disabled={!bonusCode.trim() || checkingBonus}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-bold text-sm bg-bgDark border border-border-gray text-text-light hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {checkingBonus ? "..." : "Check"}
                        </button>
                      </div>

                      {/* Bonus Info Display */}
                      {bonusInfo && bonusInfo.valid ? (
                        <div className={`space-y-3 p-4 rounded-xl border backdrop-blur-sm ${
                          bonusCodePurchaseLimitError
                            ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent'
                            : 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'
                        }`}>
                          {/* Success Header */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                bonusCodePurchaseLimitError ? 'bg-amber-500/20' : 'bg-primary/20'
                              }`}>
                                <svg className={`w-4 h-4 ${bonusCodePurchaseLimitError ? 'text-amber-500' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className={`font-bold text-sm uppercase tracking-wide ${
                                bonusCodePurchaseLimitError ? 'text-amber-500' : 'text-primary'
                              }`}>
                                +{bonusInfo.percentage}% Bonus Code
                              </span>
                            </div>
                          </div>

                          {/* Purchase Limits Info - Show if code has limits */}
                          {(bonusInfo.minPurchaseAmount !== null || bonusInfo.maxPurchaseAmount !== null) && (
                            <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-bgDark/40 border border-border-gray/30">
                              <CurrencyDollarIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                <span className="text-text-muted">Valid for purchases:</span>
                                {bonusInfo.minPurchaseAmount !== null && (
                                  <span className="text-text-light font-semibold">
                                    Min ${bonusInfo.minPurchaseAmount.toLocaleString()}
                                  </span>
                                )}
                                {bonusInfo.minPurchaseAmount !== null && bonusInfo.maxPurchaseAmount !== null && (
                                  <span className="text-text-muted">-</span>
                                )}
                                {bonusInfo.maxPurchaseAmount !== null && (
                                  <span className="text-text-light font-semibold">
                                    Max ${bonusInfo.maxPurchaseAmount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Warning if purchase is outside limits */}
                          {bonusCodePurchaseLimitError && (
                            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                              <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-amber-400">
                                    {bonusCodePurchaseLimitError.message}
                                  </p>
                                  <p className="text-xs text-text-muted mt-1">
                                    Your purchase: ${bonusCodePurchaseLimitError.current.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} — {bonusCodePurchaseLimitError.type === 'below_min' ? 'Increase' : 'Decrease'} your amount to use this bonus code
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Calculation Breakdown - Only show if within limits */}
                          {!bonusCodePurchaseLimitError && toValue && parseFloat(toValue.toString()) > 0 ? (
                            <div className="space-y-2.5 bg-bgDark/60 rounded-lg p-3 border border-border-gray/50">
                              {/* Base Amount */}
                              <div className="flex items-center justify-between">
                                <span className="text-text-gray text-xs">Base Purchase</span>
                                <span className="text-text-light font-semibold">
                                  {parseFloat(toValue.toString()).toLocaleString(undefined, { maximumFractionDigits: 2 })} VLTC
                                </span>
                              </div>

                              {/* Bonus Amount */}
                              <div className="flex items-center justify-between">
                                <span className="text-text-gray text-xs flex items-center gap-1">
                                  Bonus ({bonusInfo.percentage}%)
                                  <span className="inline-block w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                                </span>
                                <span className="text-primary font-bold">
                                  +{(parseFloat(toValue.toString()) * bonusInfo.percentage / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} VLTC
                                </span>
                              </div>

                              {/* Divider */}
                              <div className="border-t border-border-gray/30"></div>

                              {/* Total Amount */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-text-light text-sm font-semibold">Total You'll Receive</span>
                                <span className="text-text-light text-lg font-bold">
                                  {(parseFloat(toValue.toString()) * (1 + bonusInfo.percentage / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })} VLTC
                                </span>
                              </div>
                            </div>
                          ) : !bonusCodePurchaseLimitError ? (
                            <p className="text-text-gray text-xs text-center py-2">
                              Enter an amount above to see your bonus calculation
                            </p>
                          ) : null}

                          {/* Additional Info */}
                          {!bonusCodePurchaseLimitError && (
                            <div className="flex items-start gap-2 pt-1">
                              <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-text-muted text-[11px] leading-relaxed">
                                Your bonus tokens will be included in your total balance and available for claiming after the presale ends.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : bonusInfo && !bonusInfo.valid ? (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-red-400">
                                {bonusInfo.message}
                              </p>
                              <p className="text-text-muted text-[11px] mt-1">
                                Please check your code and try again, or proceed without a bonus code.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {!bonusInfo && (
                        <p className="text-[10px] text-text-muted">
                          Have a referral or bonus code? Enter it above and click "Check" to validate
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Native gas warning */}
                  {balances[chain.nativeCurrency.symbol] == 0 ? (
                    <div className="text-center text-xs">
                      <p className="m-2 leading-5 text-amber-600">
                        You do not have enough {chain?.nativeCurrency.symbol} to pay
                        for this transaction.
                      </p>
                    </div>
                  ) : null}

                  {/* Min/Max Limit Warning Messages */}
                  {(belowMinLimit || aboveMaxLimit) && fromValue && (
                    <div className="mt-4 p-3 rounded-lg border border-orange-500/40 bg-orange-500/10 backdrop-blur-sm">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-400">
                            {belowMinLimit && `Minimum purchase: $${minBuyLimit.toLocaleString()}`}
                            {aboveMaxLimit && `Maximum purchase: $${maxBuyLimit.toLocaleString()}`}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Current purchase value: ${purchaseUSD > 0 ? purchaseUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button - Full Width */}
                  <div className="my-4">
                    <button
                      className="btn-primary btn-sheen w-full"
                      disabled={
                        !fromValue ||
                        loading ||
                        insufficientBalance ||
                        belowMinLimit ||
                        aboveMaxLimit ||
                        !saleStatus ||
                        bonusCodePurchaseLimitError != null ||
                        true //disable buy
                      }
                      type="submit"
                    >
                      {buttonTitle}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Simplified view when wallet not connected */}
                <div className="mt-6 mb-4">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      {/* <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                        <WalletIcon className="w-8 h-8 text-white" />
                      </div> */}
                      <WalletIcon className="w-8 h-8 text-orange-500" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-text-light mb-2">
                        Buy $VLTC with Crypto
                      </h3>
                      {/* <p className="text-sm text-text-muted">
                        Connect your wallet to purchase VLTC
                      </p> */}
                    </div>

                    <div className="flex justify-center gap-1.5 py-2">
                      {['ETH', 'BNB', 'POL', 'USDT', 'USDC'].map((currency) => (
                        <div
                          key={currency}
                          className="px-2.5 py-1.5 rounded-lg bg-bgDark border border-border-gray text-text-light font-semibold text-xs"
                        >
                          {currency}
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn-primary btn-sheen w-full mt-4"
                      type="submit"
                    >
                      {buttonTitle}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {isBuyWithCardModalOpen && (
          <BuyWithCardModal closeModal={() => setIsBuyWithCardModalOpen(false)} />
        )}
        {isConnectWalletModalOpen && (
          <ConnectWalletModal
            closeModal={() => setIsConnectWalletModalOpen(false)}
          />
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-[11px] tracking-wide text-text-muted">
          Need help? Contact <a target="_blank" href="https://t.me/VaultcoinSupport" className="font-semibold text-text-light">VaultCoin Support</a>
        </div>
      </form>
      )}
    </div>
  );
};

export default BuyForm;

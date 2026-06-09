import { useSelector } from "react-redux";
import { RootState } from "../store";
import config from "../config";
import { formatNumber } from "../utils";
import useCurrentChain from "../hooks/useCurrentChain";

const LockedBalanceCard = () => {
  const chain = useCurrentChain();
  const balances = useSelector((state: RootState) => state.wallet.balances);
  const multiChainBalances = useSelector((state: RootState) => state.wallet.multiChainSaleTokenBalances);
  const saleToken = config.saleToken;
  const toToken = saleToken[chain.id];

  // Calculate total balance across all chains
  const totalMultiChainBalance = Object.values(multiChainBalances).reduce((sum, balance) => sum + balance, 0);
  const lockedBalance = formatNumber(totalMultiChainBalance);

  // Mock data for demonstration - replace with actual data from your backend
  const totalInvested = "$1,234.56";
  const tokenPrice = "$0.00031";
  const nextUnlock = "15 days";

  return (
    <div className="dashboard-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-light">Locked Balance</h2>
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl">
          🔒
        </div>
      </div>

      {/* Main Balance */}
      <div className="mb-6 p-4 rounded-lg bg-bgDark border border-border-dark">
        <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
          Total Locked Tokens
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-text-light">
            {lockedBalance}
          </p>
          <p className="text-text-gray font-medium">
            {toToken?.symbol || 'TOKENS'}
          </p>
        </div>
      </div>

      {/* Chain Breakdown */}
      {Object.keys(multiChainBalances).length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-bgDark/50 border border-border-dark">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-3">
            Balance by Chain
          </p>
          <div className="space-y-2">
            {config.chains.map((chainConfig) => {
              const balance = multiChainBalances[chainConfig.id] || 0;
              if (balance === 0) return null;

              return (
                <div key={chainConfig.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={config.chainDetails[chainConfig.id]?.img}
                      alt={chainConfig.name}
                      className="h-5 w-5 object-contain"
                    />
                    <span className="text-text-gray text-sm">{config.chainDetails[chainConfig.id]?.name || chainConfig.name}</span>
                  </div>
                  <span className="text-text-light font-semibold text-sm">
                    {formatNumber(balance)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border-dark">
          <span className="text-text-gray text-sm">Total Invested</span>
          <span className="text-text-light font-semibold">{totalInvested}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border-dark">
          <span className="text-text-gray text-sm">Token Price</span>
          <span className="text-text-light font-semibold">{tokenPrice}</span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border-dark">
          <span className="text-text-gray text-sm">Next Unlock</span>
          <span className="text-primary font-semibold">{nextUnlock}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-text-gray text-sm">Status</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-500 font-semibold text-sm">Active</span>
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button className="mt-6 w-full py-3 rounded-lg bg-bgDark border border-border-gray text-text-light font-semibold hover:border-primary hover:bg-opacity-80 transition-all">
        View Details
      </button>
    </div>
  );
};

export default LockedBalanceCard;
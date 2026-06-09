import { useSelector } from "react-redux";
import { RootState } from "../store";
import config from "../config";
import { formatNumber } from "../utils";

const StatsOverview = () => {
  const totalTokensSold = useSelector((s: RootState) => s.presale.totalTokensSold);
  const balances = useSelector((state: RootState) => state.wallet.balances);
  const saleToken = config.saleToken;
  const totalTokensForSale = config.stage.total;

  const soldPercentage = ((totalTokensSold / totalTokensForSale) * 100).toFixed(2);

  // Get the first chain's sale token for display
  const toToken = saleToken[config.chains[0].id];
  const userBalance = formatNumber(balances[toToken?.symbol] || 0);

  const stats = [
    {
      label: "Your Balance",
      value: `${userBalance} ${toToken?.symbol || 'TOKENS'}`,
      icon: "💰",
      color: "from-orange-500 to-red-500",
    },
    {
      label: "Total Sold",
      value: `${formatNumber(totalTokensSold)} / ${formatNumber(totalTokensForSale)}`,
      icon: "📈",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Sale Progress",
      value: `${soldPercentage}%`,
      icon: "🎯",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Current Stage",
      value: "Stage 1",
      icon: "🚀",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stat-card group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-30 transition-opacity`}
            />
          </div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
            {stat.label}
          </p>
          <p className="text-text-light text-xl font-bold">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
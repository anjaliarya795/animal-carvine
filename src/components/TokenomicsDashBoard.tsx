import React from 'react';
import { Lock, Unlock, TrendingUp, Clock } from 'lucide-react';

// --- Interfaces ---

interface TokenomicsItem {
  label: string;
  percent: number;
  color: string;
}

interface VestingStep {
  title: string;
  duration: string;
  desc: string;
  icon: React.ReactNode; 
  status: string;
}

const TokenomicsDashboard: React.FC = () => {
  // --- DATA ---
  const tokenomicsData: TokenomicsItem[] = [
    { label: "Partnerships", percent: 25, color: "#FF8C00" },
    { label: "Platform Dev", percent: 20, color: "#FFFFFF" },
    { label: "Ecosystem Growth", percent: 20, color: "#FFA500" },
    { label: "Team & Advisors", percent: 15, color: "#525252" },
    { label: "Early Contributors", percent: 15, color: "#A3A3A3" },
    { label: "Reserve Fund", percent: 5, color: "#383838" },
  ];

  const vestingSteps: VestingStep[] = [
    {
      title: "Claim $VLTC",
      duration: "", 
      desc: "Claim your tokens at the time of listing.",
      icon: <Lock className="w-6 h-6 md:w-10 md:h-10 text-gray-300" />, 
      status: "Locked"
    },
    {
      title: "30 Days Cliff",
      duration: "1 Month",
      desc: "10% of your $VLTC will be unlocked after the cliff ends.",
      icon: <Unlock className="w-6 h-6 md:w-10 md:h-10 text-orange-500" />,
      status: "10% Unlock"
    },
    {
      title: "Linear Unlock",
      duration: "9 Months",
      desc: "Remaining 90% will unlock over 9 months after the cliff ends.",
      icon: <TrendingUp className="w-6 h-6 md:w-10 md:h-10 text-white" />,
      status: "Monthly"
    }
  ];

  // Conic Gradient Logic
  let accumulatedPercent = 0;
  const gradientString = tokenomicsData.map(item => {
    const start = accumulatedPercent;
    accumulatedPercent += item.percent;
    const end = accumulatedPercent;
    return `${item.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <section id="tokenomics" className="py-20 bg-[#050505] relative overflow-hidden flex items-center lg:my-28 md:my-20 my-12">
       
       {/* Background Glow */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="mx-auto w-[95%] lg:w-[90%] relative z-10">
        
        {/* Header */}
        <div className="text-center md:mb-24 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            Tokenomics <span className="text-gray-600">&</span> Vesting
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
             Total Supply: <span className="text-orange-500 font-bold">10,000,000,000 $VLTC</span>
          </p>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch px-3">

          {/* === LEFT COLUMN: CHART & DISTRIBUTION === */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col shadow-2xl h-full">
             
             {/* 1. Chart Section */}
             <div className="flex justify-center mb-10 relative">
                <div 
                    className="w-[220px] h-[220px] md:w-[260px] md:h-[260px] rounded-full relative shadow-[0_0_40px_rgba(255,140,0,0.05)]"
                    style={{ 
                        background: `conic-gradient(${gradientString})`
                    }}
                >
                  <div className="absolute inset-8 bg-[#121212] rounded-full flex flex-col items-center justify-center border border-white/5 shadow-inner">
                    <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">100%</span>
                    <span className="text-[10px] uppercase text-gray-500 tracking-widest mt-1">Allocation</span>
                  </div>
                </div>
             </div>

             {/* 2. Distribution List */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                {tokenomicsData.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-orange-500/30 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                                {item.label}
                            </span>
                        </div>
                        <span className="text-white font-bold text-sm font-mono bg-black/40 px-2 py-1 rounded">
                            {item.percent}%
                        </span>
                    </div>
                ))}
             </div>
          </div>


          {/* === RIGHT COLUMN: VESTING SCHEDULE (Responsive Update) === */}
          <div className="flex flex-col gap-4 h-full">
            
            {vestingSteps.map((step, index) => (
                <div 
                    key={index} 
                    className="flex-1 bg-[#121212] border border-white/5 rounded-2xl p-5 md:p-6 relative group hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/10 flex flex-col justify-center"
                >
                    {/* Main Container: Stack on Mobile, Row on Desktop */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                        
                        {/* Left Side: Icon Box + Text */}
                        <div className="flex items-start sm:items-center gap-4 md:gap-6">
                            {/* Icon Box: Visible on Mobile now, just smaller */}
                            <div className="w-12 h-12 md:w-24 md:h-24 flex-shrink-0 rounded-xl md:rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-inner">
                                {step.icon}
                            </div>
                            
                            <div className="flex-1">
                                <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-orange-500 transition-colors mb-1 md:mb-2">
                                    {step.title}
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-full md:max-w-[280px]">
                                    {step.desc}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Status + Duration */}
                        <div className="flex flex-col items-center justify-center gap-2 ml-auto mt-2 sm:mt-0">
                            
                            {/* Status Badge */}
                            <span className="px-3 md:px-4 py-1.5 rounded-md bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20 whitespace-nowrap text-center">
                                {step.status}
                            </span>
                            
                            {/* Duration Text */}
                            {step.duration && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                  <Clock size={14} />
                                  <span>{step.duration}</span>
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

          </div>

        </div>
      </div>
    </section>
  );
};

export default TokenomicsDashboard;
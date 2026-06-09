import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  Icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ label, value, subValue, Icon, gradient }) => {
  return (
    <div className="stat-card group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-gray text-sm font-medium tracking-wide transition-colors group-hover:text-text-light">
            {label}
          </span>
          <div className={`icon-container relative w-10 h-10 rounded-lg ${gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
            <Icon className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-text-light mb-1 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300">
            {value}
          </h3>
          {subValue && (
            <p className="text-sm text-text-muted font-medium transition-colors duration-300 group-hover:text-primary">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
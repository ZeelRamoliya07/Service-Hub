import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, accentColor = '#FFD600', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`brutal-card p-5 cursor-pointer transition-all duration-100 hover:-translate-y-1 hover:brutal-shadow-lg flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-black bg-white px-2 py-0.5 border-2 border-black inline-block">
          {title}
        </span>
        {Icon && (
          <div
            className="p-2 border-2 border-black font-bold flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            <Icon className="w-5 h-5 text-black" />
          </div>
        )}
      </div>

      <div className="my-3">
        <div className="text-4xl lg:text-5xl font-black font-heading text-black tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      {subtitle && (
        <div className="text-xs font-bold text-neutral-700 uppercase border-t-2 border-black pt-2 flex items-center gap-1.5">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from 'react';

const Card = ({ children, title, subtitle, action, className = '', accentColor }) => {
  return (
    <div className={`brutal-card p-5 relative overflow-hidden ${className}`}>
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-2 border-b-2 border-black"
          style={{ backgroundColor: accentColor }}
        />
      )}
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
          <div>
            {title && <h3 className="text-lg font-extrabold uppercase text-black font-heading">{title}</h3>}
            {subtitle && <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

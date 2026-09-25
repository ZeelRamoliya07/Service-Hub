import React from 'react';

const Badge = ({ children, status, priority, className = '' }) => {
  let bg = 'bg-neutral-200 text-black';

  const val = (status || priority || children || '').toString().toUpperCase();

  switch (val) {
    case 'PENDING':
      bg = 'bg-[#FFD600] text-black';
      break;
    case 'ASSIGNED':
      bg = 'bg-[#0057FF] text-white';
      break;
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      bg = 'bg-[#0057FF] text-white';
      break;
    case 'COMPLETED':
    case 'CONFIRMED':
      bg = 'bg-[#B7FF00] text-black';
      break;
    case 'CANCELLED':
      bg = 'bg-[#FF3B30] text-white';
      break;

    // Priority
    case 'URGENT':
      bg = 'bg-[#FF3B30] text-white';
      break;
    case 'HIGH':
      bg = 'bg-[#FFD600] text-black';
      break;
    case 'MEDIUM':
      bg = 'bg-black text-white';
      break;
    case 'LOW':
      bg = 'bg-neutral-300 text-black';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-black uppercase tracking-wider border-2 border-black rounded-none ${bg} ${className}`}
    >
      {val.replace('_', ' ')}
    </span>
  );
};

export default Badge;

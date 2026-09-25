import React from 'react';
import Button from './Button';

const EmptyState = ({ title = 'No Data Found', message, actionText, onAction, icon: Icon }) => {
  return (
    <div className="brutal-card p-10 text-center flex flex-col items-center justify-center my-6">
      {Icon && (
        <div className="p-4 border-3 border-black bg-[#FFD600] mb-4 inline-block brutal-shadow-sm">
          <Icon className="w-10 h-10 text-black" />
        </div>
      )}
      <h3 className="text-xl font-extrabold uppercase font-heading text-black mb-2">{title}</h3>
      {message && <p className="text-sm font-semibold text-neutral-600 max-w-md mb-6">{message}</p>}
      {actionText && onAction && (
        <Button variant="yellow" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

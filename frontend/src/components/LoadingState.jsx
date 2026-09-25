import React from 'react';

const LoadingState = ({ message = 'LOADING OPERATIONS...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 my-6 gap-4">
      <div className="w-12 h-12 border-4 border-black border-t-[#FFD600] animate-spin brutal-shadow-sm" />
      <span className="text-xs font-black uppercase tracking-widest text-black bg-white px-3 py-1 border-2 border-black">
        {message}
      </span>
    </div>
  );
};

export default LoadingState;

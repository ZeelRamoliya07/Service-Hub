import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'SYSTEM CONNECTION LOST',
  message = 'Unable to establish communication with the ServiceHub backend API.',
  onRetry,
}) => {
  return (
    <div className="brutal-card bg-[#FF3B30] text-white p-8 text-center flex flex-col items-center justify-center my-6">
      <div className="p-4 border-3 border-black bg-white text-black mb-4 inline-block brutal-shadow-sm">
        <AlertTriangle className="w-10 h-10 text-[#FF3B30]" />
      </div>
      <h3 className="text-2xl font-black uppercase font-heading tracking-tight mb-2">{title}</h3>
      <p className="text-sm font-semibold max-w-md mb-6 opacity-95">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onAction || onRetry}>
          <RefreshCw className="w-4 h-4 mr-2 inline-block animate-spin-hover" />
          RETRY CONNECTION
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

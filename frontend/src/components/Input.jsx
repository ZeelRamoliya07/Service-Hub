import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-black">
          {label} {required && <span className="text-[#FF3B30]">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`brutal-input text-sm text-black ${error ? 'border-[#FF3B30] bg-red-50' : 'border-black'} ${disabled ? 'bg-neutral-200 cursor-not-allowed' : ''}`}
        {...props}
      />
      {error && <span className="text-xs font-bold text-[#FF3B30] uppercase tracking-wide">{error}</span>}
    </div>
  );
};

export default Input;

import React from 'react';

const Select = ({
  label,
  id,
  options = [], // [{ value, label }]
  value,
  onChange,
  error,
  required = false,
  className = '',
  disabled = false,
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-black">
          {label} {required && <span className="text-[#FF3B30]">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`brutal-input text-sm text-black cursor-pointer font-medium ${error ? 'border-[#FF3B30] bg-red-50' : 'border-black'} ${disabled ? 'bg-neutral-200 cursor-not-allowed' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-bold text-[#FF3B30] uppercase tracking-wide">{error}</span>}
    </div>
  );
};

export default Select;

import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary (black/white), yellow, red, blue, lime, outline
  size = 'md', // sm, md, lg
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyle = 'brutal-btn flex items-center justify-center font-bold tracking-wider rounded-none uppercase transition-all duration-100';

  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-800',
    yellow: 'bg-[#FFD600] text-black hover:bg-[#e6c200]',
    red: 'bg-[#FF3B30] text-white hover:bg-[#e03126]',
    blue: 'bg-[#0057FF] text-white hover:bg-[#004bde]',
    lime: 'bg-[#B7FF00] text-black hover:bg-[#a3e600]',
    outline: 'bg-white text-black hover:bg-neutral-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs brutal-border-sm',
    md: 'px-5 py-2.5 text-sm brutal-border',
    lg: 'px-7 py-3.5 text-base brutal-border',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

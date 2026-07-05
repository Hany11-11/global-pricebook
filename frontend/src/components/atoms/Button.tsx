import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'sm', className = '', children, ...rest }: ButtonProps) {
  const classes = `btn btn-${variant} btn-${size} ${className}`.trim();

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

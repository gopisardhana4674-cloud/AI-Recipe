import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-gray-300 tracking-wide uppercase px-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-md focus:ring-2 focus:ring-orange-500/20
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-400 font-medium px-1 mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

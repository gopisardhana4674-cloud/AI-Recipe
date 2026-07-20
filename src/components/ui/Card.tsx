import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  hoverEffect = true,
  glow = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-2xl transition-all duration-300
        ${hoverEffect ? 'hover:-translate-y-1 hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-orange-500/5' : ''}
        ${glow ? 'before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-r before:from-orange-500/10 before:to-red-600/10 before:blur-xl' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pb-4 border-b border-white/[0.05] ${className}`} {...props}>{children}</div>;
}

export function CardBody({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 ${className}`} {...props}>{children}</div>;
}

export function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-4 border-t border-white/[0.05] ${className}`} {...props}>{children}</div>;
}

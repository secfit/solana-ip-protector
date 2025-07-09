import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'info', 
  size = 'md' 
}) => {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;

  return (
    <span className={`${baseClass} ${variantClass}`}>
      {children}
    </span>
  );
};
import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    className={cn('card rounded-xl border border-slate-200 bg-white shadow-sm', className)}
    {...props}
  />
);

export interface CardHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  subtitle,
  children,
}) => (
  <div
    className={cn('px-6 py-4 border-b border-slate-200', className)}
  >
    {title && (
      <h3 className="text-lg font-semibold text-dark-900">{title}</h3>
    )}
    {subtitle && (
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    )}
    {children}
  </div>
);

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody: React.FC<CardBodyProps> = ({ className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props} />
);

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter: React.FC<CardFooterProps> = ({ className, ...props }) => (
  <div
    className={cn('px-6 py-4 border-t border-slate-200', className)}
    {...props}
  />
);

export { Card, CardHeader, CardBody, CardFooter };
export default Card;

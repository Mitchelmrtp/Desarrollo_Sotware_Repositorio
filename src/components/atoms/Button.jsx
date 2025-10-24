// 🧱 Button Component - Single Responsibility Principle
// This component only handles button rendering and click events

import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { cn } from '../../utils/classNames';

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'hover:bg-gray-100 hover:text-gray-900',
  link: 'text-blue-600 underline-offset-4 hover:underline',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const Button = forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  disabled,
  loading = false,
  ...props
}, ref) => {
  const Comp = asChild ? 'span' : 'button';
  
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </Comp>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(buttonVariants)),
  size: PropTypes.oneOf(Object.keys(buttonSizes)),
  asChild: PropTypes.bool,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default Button;
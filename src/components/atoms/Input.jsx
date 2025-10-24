// 🔤 Input Component - Single Responsibility Principle
// This component only handles input field rendering and validation states

import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { cn } from '../../utils/classNames';

const Input = forwardRef(({
  className,
  type = 'text',
  error,
  label,
  id,
  placeholder,
  disabled,
  required,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-300 focus-visible:ring-red-500'
            : 'border-gray-300 focus-visible:ring-blue-500',
          className
        )}
        placeholder={placeholder}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default Input;
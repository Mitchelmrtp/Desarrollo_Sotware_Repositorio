// 📱 Avatar Component - Single Responsibility Principle
// This component only handles user avatar display

import PropTypes from 'prop-types';
import { cn } from '../../utils/classNames';

const Avatar = ({ className, src, alt, fallback, size = 'default', ...props }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt || 'Avatar'}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-600',
          src ? 'hidden' : 'flex'
        )}
      >
        {fallback || (
          <svg
            className="h-1/2 w-1/2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
    </div>
  );
};

Avatar.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string,
  alt: PropTypes.string,
  fallback: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl']),
};

export default Avatar;
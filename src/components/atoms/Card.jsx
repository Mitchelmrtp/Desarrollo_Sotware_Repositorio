// 🎨 Card Component - Single Responsibility Principle
// This component only handles card layout and styling

import PropTypes from 'prop-types';
import { cn } from '../../utils/classNames';

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm bg-white border-gray-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ className, children, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ className, children, ...props }) => (
  <p
    className={cn('text-sm text-muted-foreground text-gray-600', className)}
    {...props}
  >
    {children}
  </p>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className, children, ...props }) => (
  <div
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  >
    {children}
  </div>
);

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
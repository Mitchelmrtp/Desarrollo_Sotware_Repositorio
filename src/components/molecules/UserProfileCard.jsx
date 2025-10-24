// 👤 User Profile Card Molecule - Combines Avatar, Card and content
// Following Single Responsibility Principle

import PropTypes from 'prop-types';
import { Card, CardContent, Avatar } from '../atoms';

const UserProfileCard = ({
  user,
  showEmail = true,
  showRole = true,
  size = 'default',
  className,
  onClick,
  ...props
}) => {
  if (!user) return null;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      {...props}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={user.avatar}
            alt={user.name}
            fallback={user.name?.charAt(0)?.toUpperCase()}
            size={size}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </h3>
            {showEmail && user.email && (
              <p className="text-sm text-gray-500 truncate">
                {user.email}
              </p>
            )}
            {showRole && user.role && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                {user.role}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

UserProfileCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    avatar: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  showEmail: PropTypes.bool,
  showRole: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default UserProfileCard;
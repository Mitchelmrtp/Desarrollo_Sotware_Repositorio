// 🔍 Search Bar Molecule - Combines Input with search functionality
// Following Single Responsibility Principle

import PropTypes from 'prop-types';
import { useState } from 'react';
import { Input, Button } from '../atoms';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({
  placeholder = 'Buscar...',
  onSearch,
  onClear,
  value = '',
  onChange,
  className,
  showClearButton = true,
  disabled = false,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState(value);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);
  };

  const handleSearch = () => {
    onSearch?.(searchValue);
  };

  const handleClear = () => {
    setSearchValue('');
    onClear?.();
    onChange?.('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="pr-10"
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {showClearButton && searchValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6 hover:bg-gray-100"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <Button
        onClick={handleSearch}
        disabled={disabled || !searchValue.trim()}
        className="px-4"
      >
        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  showClearButton: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default SearchBar;
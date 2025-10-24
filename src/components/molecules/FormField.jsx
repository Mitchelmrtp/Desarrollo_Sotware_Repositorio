// 📝 Form Field Molecule - Combines Input with validation
// Following Composition over Inheritance principle

import PropTypes from 'prop-types';
import { Input } from '../atoms';

const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <div className={className}>
      <Input
        id={name}
        name={name}
        type={type}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        required={required}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default FormField;
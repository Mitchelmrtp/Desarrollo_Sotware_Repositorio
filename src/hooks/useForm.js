// 📝 useForm Hook - Template Method Pattern for form handling
// Following Template Method Pattern and Single Responsibility Principle

import { useState, useCallback, useRef } from 'react';

export const useForm = (initialValues = {}, validationRules = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef();

  // Template method for validation
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rules.requiredMessage || `${name} es requerido`;
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.minLengthMessage || `${name} debe tener al menos ${rules.minLength} caracteres`;
    }

    // Max length validation
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.maxLengthMessage || `${name} no puede tener más de ${rules.maxLength} caracteres`;
    }

    // Email validation
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return rules.emailMessage || 'Email no válido';
      }
    }

    // Pattern validation
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || `${name} no tiene el formato correcto`;
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value, values);
      if (customError) return customError;
    }

    return '';
  }, [validationRules, values]);

  // Template method for validating all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [values, validateField, validationRules]);

  // Template method for handling field changes
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Validate field on change if it has been touched
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  }, [errors, touched, validateField]);

  // Template method for handling field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const fieldError = validateField(name, values[name]);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));
  }, [values, validateField]);

  // Template method for handling form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setSubmitCount(prev => prev + 1);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();
    
    if (!isValid) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors).find(field => errors[field]);
      if (firstErrorField && formRef.current) {
        const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.focus();
        }
      }
      return;
    }

    if (onSubmit && typeof onSubmit === 'function') {
      setIsSubmitting(true);
      try {
        await onSubmit(values, { setErrors, setValues, resetForm });
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, errors, onSubmit, validationRules]);

  // Template method for resetting form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  // Template method for setting field value
  const setFieldValue = useCallback((name, value) => {
    handleChange(name, value);
  }, [handleChange]);

  // Template method for setting field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  // Template method for getting field props
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : '',
  }), [values, errors, touched, handleChange, handleBlur]);

  // Check if form is valid
  const isValid = Object.keys(errors).every(key => !errors[key]) && 
                  Object.keys(validationRules).every(key => touched[key]);

  // Check if form has been modified
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    isValid,
    isDirty,
    formRef,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldProps,
    validateForm,
    validateField,

    // Utilities
    setValues,
    setErrors,
    setTouched,
  };
};

export default useForm;
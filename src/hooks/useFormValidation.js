import { useState, useCallback } from 'react';

const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Optional: track submission state

  const validate = useCallback((fieldValues = values) => {
    const tempErrors = {};
    for (const field in validationRules) {
      const rules = validationRules[field];
      const value = fieldValues[field];
      // Example rule: required
      if (rules.required && !value) {
        tempErrors[field] = rules.requiredMessage || 'This field is required';
        continue; // Stop checking other rules for this field if required fails
      }
      // Example rule: pattern (regex)
      if (rules.pattern && value && !rules.pattern.test(value)) { // Check if value exists before testing pattern
         tempErrors[field] = rules.patternMessage || 'Invalid format';
         continue;
      }
       // Example rule: minLength
      if (rules.minLength && value && value.length < rules.minLength) { // Check if value exists before checking length
        tempErrors[field] = rules.minLengthMessage || `Minimum length is ${rules.minLength}`;
        continue;
      }
      // Add more rules as needed (maxLength, custom function, etc.)
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Return true if no errors
  }, [values, validationRules]);


  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prevValues => ({
      ...prevValues,
      [name]: newValue,
    }));

    // Optional: Validate on change after first submit or on blur
    // Consider validating only if the field previously had an error
    if (errors[name]) {
       validate({ ...values, [name]: newValue });
     }
  }, [validate, values, errors]); // Added dependencies

  const handleBlur = useCallback((event) => {
     // Validate on blur to give immediate feedback
     const { name } = event.target;
     if (validationRules[name]) {
        validate(values);
     }
  }, [validate, values, validationRules])


  const handleSubmit = useCallback((callback) => async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    if (validate()) {
      try {
        await callback(values); // Execute the provided submit function
      } catch (error) {
         // Handle potential errors from the callback (e.g., API errors)
         console.error("Submission error:", error);
         // Optionally set form-level errors here
      } finally {
        setIsSubmitting(false);
      }
    } else {
       setIsSubmitting(false); // Ensure isSubmitting is reset if validation fails
    }
  }, [validate, values]);

  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);


  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors, // Allow manual setting of backend errors
    validate // Expose validate function if needed externally
  };
};

export default useFormValidation; 
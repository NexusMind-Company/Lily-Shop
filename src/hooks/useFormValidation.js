import { useState, useCallback } from "react";

const useFormValidation = (initialState, validationRules) => {
  if (!initialState || typeof initialState !== "object") {
    throw new Error("useFormValidation: initialState must be an object");
  }

  if (!validationRules || typeof validationRules !== "object") {
    throw new Error("useFormValidation: validationRules must be an object");
  }

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (fieldValues = values) => {
      const tempErrors = {};

      for (const field in validationRules) {
        if (!Object.prototype.hasOwnProperty.call(validationRules, field))
          continue;

        const rules = validationRules[field];
        const value = fieldValues[field];

        // Required field check
        if (rules.required && (!value || value.toString().trim() === "")) {
          tempErrors[field] = rules.requiredMessage || "This field is required";
          continue;
        }

        // Email format check
        if (rules.email && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            tempErrors[field] = rules.invalidMessage || "Invalid email format";
            continue;
          }
        }

        // Pattern matching
        if (rules.pattern && value) {
          if (!rules.pattern.test(value)) {
            tempErrors[field] = rules.patternMessage || "Invalid format";
            continue;
          }
        }

        // Min length check
        if (rules.minLength && value && value.length < rules.minLength) {
          tempErrors[field] =
            rules.minLengthMessage || `Minimum length is ${rules.minLength}`;
          continue;
        }

        // Max length check
        if (rules.maxLength && value && value.length > rules.maxLength) {
          tempErrors[field] =
            rules.maxLengthMessage || `Maximum length is ${rules.maxLength}`;
          continue;
        }
      }

      setErrors(tempErrors);
      return Object.keys(tempErrors).length === 0;
    },
    [values, validationRules],
  );

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prevValues) => {
        const updatedValues = { ...prevValues, [name]: newValue };
        if (errors[name]) {
          validate(updatedValues);
        }
        return updatedValues;
      });
    },
    [validate, errors],
  );

  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target;
      if (validationRules[name]) {
        validate(values);
      }
    },
    [validate, values, validationRules],
  );

  const handleSubmit = useCallback(
    (callback) => async (event) => {
      event.preventDefault();
      setIsSubmitting(true);

      if (validate()) {
        try {
          await callback(values);
        } catch (error) {
          console.error("Submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
      }
    },
    [validate, values],
  );

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
    setErrors,
    validate,
  };
};

export default useFormValidation;

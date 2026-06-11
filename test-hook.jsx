/* eslint-disable react-refresh/only-export-components */
/* global global */
import { useState } from "react";
import useFormValidation from "./src/hooks/useFormValidation";

// Mock React.createElement for testing purposes
global.React = {
  useState,
};

const TestHook = () => {
  console.log("Testing useFormValidation hook...");

  const INITIAL_FORM_STATE = {
    name: "",
    cuisine: "",
    description: "",
    contact_email: "",
    contact_phone: "",
  };

  const VALIDATION_RULES = {
    name: {
      required: true,
      requiredMessage: "Vendor name is required.",
      maxLength: 255,
    },
    description: {
      required: true,
      requiredMessage: "Description is required.",
    },
    cuisine: { required: false, maxLength: 255 },
    contact_email: {
      required: false,
      email: true,
      invalidMessage: "Please enter a valid email.",
      maxLength: 254,
    },
    contact_phone: { required: false, maxLength: 20 },
  };

  try {
    // Attempt to call the hook
    const result = useFormValidation(INITIAL_FORM_STATE, VALIDATION_RULES);
    console.log("✓ Hook call successful");
    console.log("Returned values:", Object.keys(result));
  } catch (error) {
    console.error("✗ Hook call failed:", error);
    console.error("Error stack:", error.stack);
  }
};

TestHook();

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, ArrowLeft, Upload, X, ZoomIn, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";

// Image compression utility
const compressImage = (file, quality = 0.8, maxWidth = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, "image/webp", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// File validation utility
const validateFile = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const maxDimensions = 4096; // 4K max

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPG, PNG, GIF, and WebP files are allowed",
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  // Additional validation for image dimensions
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width > maxDimensions || img.height > maxDimensions) {
        resolve({
          valid: false,
          error: "Image dimensions too large (max 4096px)",
        });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      resolve({ valid: false, error: "Corrupted or invalid image file" });
    };
    img.src = URL.createObjectURL(file);
  });
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars
    .replace(/_{2,}/g, "_") // Replace multiple underscores
    .substring(0, 100); // Limit length
};

const UploadProfilePic = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fileInputRef = useRef(null);
  const uploadControllerRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // API endpoint
  const apiUrl = import.meta.env.VITE_API_URL;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
    }
  }, [previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Enhanced upload mutation with timeout and retry
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      // Cancel previous upload
      if (uploadControllerRef.current) {
        uploadControllerRef.current.abort();
      }

      // Create new abort controller
      uploadControllerRef.current = new AbortController();

      const response = await fetch(`${apiUrl}/api/upload-profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
        signal: uploadControllerRef.current.signal,
        // Add timeout
        timeout: 30000, // 30 seconds
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Upload failed (${response.status})`
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadProgress(100);

      // Update Redux store
      dispatch({
        type: "auth/updateProfilePicture",
        payload: data.profilePictureUrl,
      });

      // Cache the image
      const img = new Image();
      img.src = data.profilePictureUrl;

      setTimeout(() => navigate("/dashboard"), 1000);
    },
    onError: (error) => {
      console.error("Upload error:", error);

      // Retry logic for network errors
      if (
        (error.name === "AbortError" || error.message.includes("network")) &&
        retryCount < 3
      ) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          uploadMutation.mutate();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        setValidationError(`Upload failed: ${error.message}`);
        setUploadProgress(0);
      }
    },
  });

  // Debounced file selection
  const debounceTimeout = useRef(null);
  const debouncedFileSelect = useCallback((file) => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      await handleFileProcess(file);
    }, 300);
  }, []);

  // Enhanced file processing
  const handleFileProcess = async (file) => {
    setValidationError("");
    setIsCompressing(true);

    try {
      // Validate file
      const validation = await validateFile(file);
      if (!validation.valid) {
        setValidationError(validation.error);
        setIsCompressing(false);
        return;
      }

      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.name);

      // Compress image
      const compressedFile = await compressImage(file);

      // Create new file with sanitized name
      const finalFile = new File([compressedFile], sanitizedName, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      setSelectedImage(finalFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        // Cleanup previous preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(e.target.result);
        setIsCompressing(false);
      };
      reader.readAsDataURL(finalFile);
    } catch (error) {
      console.error("File processing error:", error);
      setValidationError("Failed to process image. Please try another file.");
      setIsCompressing(false);
    }
  };

  // Handle file input change
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      debouncedFileSelect(file);
    }
  };

  // Trigger file input
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setValidationError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission with progress tracking
  const handleConfirm = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("profilePicture", selectedImage);
      formData.append("userId", user?.id);
      formData.append("timestamp", Date.now().toString());

      // Reset retry count
      setRetryCount(0);
      setUploadProgress(0);

      // Simulate progress (replace with real progress in production)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      uploadMutation.mutate(formData);
    } else {
      navigate("/login");
    }
  };
  const handleBackToLogin = () => {
    cleanup();
    navigate("/login");
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 items-center max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Title + subtitle */}
        <div className="grid place-items-center gap-3 mb-3">
          <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
            Upload Profile Picture
          </h2>
          <p className="font-poppins font-medium text-center text-ash text-xs">
            Add a photo or avatar to personalize your profile, you can change it
            anytime.
          </p>
        </div>
        {/* Optional Label */}
        <p className="font-poppins font-medium text-start text-ash text-xs my-5">
          Optional
        </p>

        {/* Profile Picture Circle */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Main Circle */}
            <div
              className={`w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden cursor-pointer transition-transform ${
                isZoomed ? "scale-110" : "hover:scale-105"
              }`}
              onClick={
                previewUrl ? () => setIsZoomed(!isZoomed) : handleCameraClick
              }
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  previewUrl ? () => setIsZoomed(!isZoomed) : handleCameraClick
                )
              }
              tabIndex={0}
              role="button"
              aria-label={
                previewUrl
                  ? "Preview profile picture. Press Enter to zoom"
                  : "Upload profile picture. Press Enter to select file"
              }
            >
              {isCompressing ? (
                <div className="text-center text-gray-600">
                  <RotateCcw size={24} className="mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Processing...</p>
                </div>
              ) : previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Profile preview - uploaded image"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isZoomed && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <ZoomIn size={32} className="text-white" />
                    </div>
                  )}
                </>
              ) : (
                /* Default Avatar Icon */
                <img src="./profile-icon.svg" alt="" />
              )}
            </div>

            {/* Camera Button */}
            <button
              onClick={handleCameraClick}
              onKeyDown={(e) => handleKeyDown(e, handleCameraClick)}
              className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full shadow-lg border-[3px] border-[#FFFAE7] flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lily transition-all"
              aria-label="Select image file"
              tabIndex={0}
            >
              <img src="./camera-icon.svg" alt="" />
            </button>

            {/* Remove Button */}
            {previewUrl && (
              <button
                onClick={handleRemoveImage}
                onKeyDown={(e) => handleKeyDown(e, handleRemoveImage)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                aria-label="Remove selected image"
                tabIndex={0}
              >
                <X size={16} className="text-white" />
              </button>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="File input for profile picture"
            />
          </div>
        </div>

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div
            className="mb-4"
            role="progressbar"
            aria-valuenow={uploadProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {validationError && (
          <div
            className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
            role="alert"
            aria-live="polite"
          >
            {validationError}
          </div>
        )}

        {/* File Info */}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={uploadMutation.isPending || isCompressing}
          className="w-full pt-0 h-[46px] bg-lily border-none rounded-full my-5 font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
          aria-label={
            selectedImage
              ? "Confirm and upload profile picture"
              : "Skip profile picture and continue"
          }
        >
          {uploadMutation.isPending
            ? "UPLOADING..."
            : isCompressing
            ? "PROCESSING..."
            : selectedImage
            ? "CONFIRM"
            : "CONTINUE"}
        </button>

        {/* Back to Login */}
        <button
          onClick={handleBackToLogin}
          onKeyDown={(e) => handleKeyDown(e, handleBackToLogin)}
          className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:underline transition-colors"
          tabIndex={0}
        >
          <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
          <span className="font-medium">Back to Log In</span>
        </button>
      </div>
    </section>
  );
};

export default UploadProfilePic;

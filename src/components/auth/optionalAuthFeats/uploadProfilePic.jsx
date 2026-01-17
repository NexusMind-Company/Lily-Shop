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
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop"
            alt="Portrait Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lily/30 to-lily/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <h1 className="font-bold text-4xl uppercase tracking-wider">Lily Shops</h1>
          </Link>
        </div>

        <div className="relative z-10 mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins leading-tight">
            Put a Face <br /> to the Name
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Upload a profile picture to personalize your experience.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Lily Shops. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto">
            {/* Title + subtitle */}
            <div className="mb-8 text-center lg:text-left">
              <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                Upload Profile Picture
              </h2>
              <p className="font-poppins text-ash text-sm">
                Add a photo or avatar to personalize your profile, you can change it anytime.
              </p>
            </div>
            {/* Optional Label */}
            <p className="font-poppins font-medium text-start text-ash text-xs mb-5">
              Optional
            </p>

            {/* Profile Picture Circle */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Main Circle */}
                <div
                  className={`w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer transition-transform border-4 border-white shadow-xl ${isZoomed ? "scale-110" : "hover:scale-105"
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
                      <RotateCcw size={24} className="mx-auto mb-2 animate-spin text-lily" />
                      <p className="text-sm font-medium">Processing...</p>
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
                    <img src="./profile-icon.svg" alt="" className="opacity-50" />
                  )}
                </div>

                {/* Camera Button */}
                <button
                  onClick={handleCameraClick}
                  onKeyDown={(e) => handleKeyDown(e, handleCameraClick)}
                  className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full shadow-lg border-[3px] border-[#FFFAE7] flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lily transition-all group"
                  aria-label="Select image file"
                  tabIndex={0}
                >
                  <img src="./camera-icon.svg" alt="" className="group-hover:scale-110 transition-transform" />
                </button>

                {/* Remove Button */}
                {previewUrl && (
                  <button
                    onClick={handleRemoveImage}
                    onKeyDown={(e) => handleKeyDown(e, handleRemoveImage)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white border border-red-100 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    aria-label="Remove selected image"
                    tabIndex={0}
                  >
                    <X size={16} className="text-red-500" />
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
                className="mb-6"
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div className="flex justify-between text-sm text-gray-600 mb-1 font-medium">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-lily h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {validationError && (
              <div
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm"
                role="alert"
                aria-live="polite"
              >
                {validationError}
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={uploadMutation.isPending || isCompressing}
              className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 mb-6 ${uploadMutation.isPending || isCompressing
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                }`}
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
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={handleBackToLogin}
                onKeyDown={(e) => handleKeyDown(e, handleBackToLogin)}
                className="flex items-center gap-2 group p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium"
                tabIndex={0}
              >
                <ArrowLeft size={20} className="text-black group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                <span className="font-poppins text-sm group-hover:text-lily transition-colors">Back to Log In</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProfilePic;

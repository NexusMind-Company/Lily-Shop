import { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  X,
  Camera,
  Video,
  RotateCcw,
  Upload,
  Timer,
  Sparkles,
  Type,
  Check,
  Crop,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "react-hot-toast";

// ─── Utility ────────────────────────────────────────────────
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
  });

// ─── Component ──────────────────────────────────────────────
const CameraModal = ({ isOpen, onClose, onCapture }) => {
  // ── Refs (stable across renders – no flickering) ──────────
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const mountedRef = useRef(false);

  // ── Core state ────────────────────────────────────────────
  const [mode, setMode] = useState("photo"); // "photo" | "video"
  const [flipped, setFlipped] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // ── Recording state ───────────────────────────────────────
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [duration, setDuration] = useState("15s");

  // ── Timer (arm/disarm) ────────────────────────────────────
  const [timerArmed, setTimerArmed] = useState(false);
  const [countdown, setCountdown] = useState(null); // null = not counting

  // ── Text overlay ──────────────────────────────────────────
  const [textMode, setTextMode] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 }); // percentage-based

  // ── Crop (for uploaded files only) ────────────────────────
  const [cropMode, setCropMode] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // ─── Camera lifecycle (ref-based, no cascading re-renders) ─
  const startCamera = useCallback(async (facingMode, withAudio) => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: { facingMode: facingMode ? "user" : "environment" },
        audio: withAudio,
      };
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);

      if (!mountedRef.current) {
        // Component unmounted before we got the stream
        mediaStream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraReady(true);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Unable to access camera. Please allow camera permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Mount / Unmount effect — the ONLY useEffect for camera lifecycle
  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      startCamera(flipped, mode === "video");
    } else {
      mountedRef.current = false;
      stopCamera();
      // Reset transient state when modal closes
      setRecording(false);
      setRecordTimer(0);
      setCountdown(null);
      setTextMode(false);
      setOverlayText("");
      setCropMode(false);
      setImageToCrop(null);
    }

    return () => {
      mountedRef.current = false;
      stopCamera();
      clearInterval(recordIntervalRef.current);
    };
    // Intentionally only depend on isOpen — flip/mode handled explicitly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Explicit restarts (no useEffect dependency chains) ────
  const handleFlip = () => {
    const next = !flipped;
    setFlipped(next);
    startCamera(next, mode === "video");
  };

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    startCamera(flipped, newMode === "video");
  };

  // ── Text overlay helpers ──────────────────────────────────
  const clearOverlay = () => {
    setOverlayText("");
    setTextMode(false);
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const startX = e.clientX || e.touches?.[0]?.clientX;
    const startY = e.clientY || e.touches?.[0]?.clientY;
    const offsetX = startX - (textPosition.x / 100) * rect.width;
    const offsetY = startY - (textPosition.y / 100) * rect.height;

    const handleMove = (moveEvent) => {
      const moveX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      const moveY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
      const pctX = Math.max(5, Math.min(95, ((moveX - offsetX) / rect.width) * 100));
      const pctY = Math.max(5, Math.min(95, ((moveY - offsetY) / rect.height) * 100));
      setTextPosition({ x: pctX, y: pctY });
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
  };

  // ── Photo capture ─────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Burn text overlay into the image
    if (overlayText.trim()) {
      const maxWidth = canvas.width * 0.8;
      const lineHeight = 60;
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;

      const x = (textPosition.x / 100) * canvas.width;
      const y = (textPosition.y / 100) * canvas.height;

      const words = overlayText.split(" ");
      let line = "";
      let drawY = y;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.strokeText(line, x, drawY);
          ctx.fillText(line, x, drawY);
          line = words[i] + " ";
          drawY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.strokeText(line, x, drawY);
      ctx.fillText(line, x, drawY);
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return console.error("Photo blob is null");
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture({ type: "image", file, url: URL.createObjectURL(file) });
        clearOverlay();
        onClose();
      },
      "image/jpeg",
      0.92,
    );
  }, [overlayText, textPosition, onCapture, onClose]);

  // ── Timer countdown ───────────────────────────────────────
  const startCountdown = useCallback(() => {
    let sec = 3;
    setCountdown(sec);
    const interval = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(sec);
      }
    }, 1000);
  }, [capturePhoto]);

  // ── Video recording ───────────────────────────────────────
  const getDurationMs = () => {
    switch (duration) {
      case "15s": return 15000;
      case "30s": return 30000;
      case "60s": return 60000;
      case "2m":  return 120000;
      default:    return 15000;
    }
  };

  const stopRecording = useCallback(() => {
    clearInterval(recordIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current);
    const chunks = [];
    const durationMs = getDurationMs();
    const startTime = Date.now();

    recorder.ondataavailable = (e) => e.data && chunks.push(e.data);
    recorder.onstop = () => {
      clearInterval(recordIntervalRef.current);
      setRecordTimer(0);
      setRecording(false);

      if (chunks.length === 0) return console.error("No video data captured.");
      const blob = new Blob(chunks, { type: "video/mp4" });
      const file = new File([blob], `video-${Date.now()}.mp4`, {
        type: "video/mp4",
      });
      onCapture({ type: "video", file, url: URL.createObjectURL(file) });
      clearOverlay();
      onClose();
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setRecordTimer(0);

    recordIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRecordTimer(elapsed);
      if (elapsed >= durationMs) {
        stopRecording();
      }
    }, 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, onCapture, onClose, stopRecording]);

  // ── Shutter button handler ────────────────────────────────
  const handleShutter = () => {
    if (mode === "photo") {
      if (countdown !== null) return; // Already counting down
      if (timerArmed) {
        startCountdown();
      } else {
        capturePhoto();
      }
    } else {
      recording ? stopRecording() : startRecording();
    }
  };

  // ── File upload (for gallery pick) ────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video") ? "video" : "image";

    if (type === "image") {
      setImageToCrop(URL.createObjectURL(file));
      setCropMode(true);
    } else {
      onCapture({ type, file, url: URL.createObjectURL(file) });
      clearOverlay();
      onClose();
    }
    // Reset the input so the same file can be re-selected
    e.target.value = "";
  };

  // ── Crop handler ──────────────────────────────────────────
  const createCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    const image = await createImage(imageToCrop);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return console.error("Crop blob is null");
      const file = new File([blob], `cropped-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const url = URL.createObjectURL(blob);
      onCapture({ type: "image", file, url });
      setCropMode(false);
      setImageToCrop(null);
      clearOverlay();
      onClose();
    }, "image/jpeg");
  };

  // ─── Don't render if closed ───────────────────────────────
  if (!isOpen) return null;

  // ─── CROP UI ──────────────────────────────────────────────
  if (cropMode && imageToCrop) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        <div className="relative flex-1">
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            aspect={1}
            objectFit="contain"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) =>
              setCroppedAreaPixels(croppedPixels)
            }
          />
        </div>
        <div className="flex gap-4 p-6 justify-center bg-black/80 backdrop-blur-sm">
          <button
            onClick={() => {
              setCropMode(false);
              setImageToCrop(null);
            }}
            className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full text-white font-medium transition-colors min-w-[120px]"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            className="bg-lily hover:brightness-110 px-8 py-3 rounded-full text-black font-semibold transition min-w-[120px]"
          >
            <Check className="w-5 h-5 inline mr-1" /> Done
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN CAMERA UI ───────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50 select-none overflow-hidden">
      {/* ── Camera viewfinder ─────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
        />

        {/* Loading state */}
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* ── Countdown overlay ───────────────────────────── */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
            <span
              key={countdown}
              className="text-white text-9xl font-black animate-ping"
              style={{ animationDuration: "0.8s" }}
            >
              {countdown}
            </span>
          </div>
        )}

        {/* ── Recording indicator ─────────────────────────── */}
        {recording && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full z-30">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold tracking-wide">
              {new Date(recordTimer).toISOString().substr(14, 5)} / {duration}
            </span>
          </div>
        )}

        {/* ── Text overlay (draggable) ────────────────────── */}
        {overlayText && !textMode && (
          <div
            className="absolute z-20 text-white font-bold text-3xl drop-shadow-lg cursor-move select-none text-center max-w-[80%] break-words"
            style={{
              left: `${textPosition.x}%`,
              top: `${textPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            {overlayText}
          </div>
        )}

        {/* ── Top bar ─────────────────────────────────────── */}
        {!textMode && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-[env(safe-area-inset-top,12px)] pb-3 bg-gradient-to-b from-black/60 to-transparent z-10">
            <button
              onClick={() => { stopCamera(); onClose(); }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white active:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <button className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/70 text-sm font-medium">
              🎵 Coming soon
            </button>

            <button
              onClick={handleFlip}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white active:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── Right toolbar ───────────────────────────────── */}
        {!textMode && !recording && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-10">
            <button
              onClick={() => setTextMode(true)}
              className="flex flex-col items-center gap-1 text-white active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                <Type className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Text</span>
            </button>

            {mode === "photo" && (
              <button
                onClick={() => setTimerArmed((prev) => !prev)}
                className="flex flex-col items-center gap-1 text-white active:scale-95 transition-transform"
              >
                <div
                  className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                    timerArmed
                      ? "bg-lily text-black shadow-lg shadow-lily/40"
                      : "bg-black/30"
                  }`}
                >
                  <Timer className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">
                  {timerArmed ? "3s On" : "Timer"}
                </span>
              </button>
            )}

            <button
              onClick={() =>
                toast("Filters feature coming soon", { icon: "ℹ️" })
              }
              className="flex flex-col items-center gap-1 text-white active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Text input overlay ────────────────────────────── */}
      {textMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-30 px-6">
          <textarea
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            placeholder="Type your text..."
            autoFocus
            className="w-full max-w-md text-center bg-transparent border-none text-white text-2xl font-semibold focus:outline-none resize-none placeholder-white/40"
            rows={3}
          />
          <button
            onClick={() => setTextMode(false)}
            className="mt-6 bg-lily hover:brightness-110 text-black px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition min-w-[120px] justify-center"
          >
            <Check className="w-5 h-5" /> Done
          </button>
        </div>
      )}

      {/* ── Bottom controls ───────────────────────────────── */}
      {!textMode && (
        <div className="shrink-0 bg-black/80 backdrop-blur-md pb-[env(safe-area-inset-bottom,16px)] pt-4 px-6">
          {/* Duration selector – video only */}
          {mode === "video" && !recording && (
            <div className="flex justify-center gap-5 mb-4">
              {["15s", "30s", "60s", "2m"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`text-sm px-3 py-1 rounded-full transition-colors ${
                    duration === t
                      ? "bg-white text-black font-bold"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Shutter row */}
          <div className="flex items-center justify-center gap-10">
            {/* Gallery upload */}
            <label className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white cursor-pointer active:bg-white/20 transition-colors">
              <Upload className="w-6 h-6" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Shutter button */}
            <button
              onClick={handleShutter}
              disabled={!cameraReady || countdown !== null}
              className="relative group disabled:opacity-50 transition-opacity"
            >
              {mode === "photo" ? (
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group-active:scale-90 transition-transform">
                  <div className="w-16 h-16 rounded-full bg-white group-active:bg-white/80 transition-colors" />
                </div>
              ) : recording ? (
                <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center group-active:scale-90 transition-transform">
                  <div className="w-8 h-8 rounded-md bg-red-500" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center group-active:scale-90 transition-transform">
                  <div className="w-16 h-16 rounded-full bg-red-500 group-active:bg-red-400 transition-colors" />
                </div>
              )}

              {/* Timer armed indicator on shutter */}
              {timerArmed && mode === "photo" && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-lily text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  3s
                </span>
              )}
            </button>

            {/* Flip camera */}
            <button
              onClick={handleFlip}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white active:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Mode selector */}
          <div className="flex justify-center gap-8 mt-4">
            {["photo", "video"].map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`capitalize text-sm font-medium pb-1 transition-colors border-b-2 ${
                  mode === m
                    ? "text-white border-white"
                    : "text-white/40 border-transparent hover:text-white/60"
                }`}
              >
                {m === "photo" ? (
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4" /> Photo
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4" /> Video
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CameraModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
};

export default CameraModal;

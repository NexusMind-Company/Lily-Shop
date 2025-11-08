import { useRef, useState, useEffect } from "react";
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
import { mockPickMusic } from "../utils/mockMusicPicker";
// import Cropper from "react-easy-crop";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
  });

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordIntervalRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [mode, setMode] = useState("photo");
  const [flipped, setFlipped] = useState(false);
  const [duration, setDuration] = useState("15s");
  const [music, setMusic] = useState(null);
  const [uiVisible, setUiVisible] = useState(true);

  // Text overlay
  const [textMode, setTextMode] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 210, y: 200 });

  // Timer (photo countdown)
  const [timerActive, setTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Crop
  const [cropMode, setCropMode] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (isOpen) {
      initCamera();
      setUiVisible(true);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, flipped]);

  const initCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: flipped ? "user" : "environment" },
        audio: mode === "video",
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Unable to access camera. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleFlip = () => setFlipped((prev) => !prev);
  const clearOverlay = () => {
    setOverlayText("");
    setTextMode(false);
  };

  //  Capture Photo with accurate text positioning
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw overlay text (accurate position + wrapping)
    if (overlayText.trim()) {
      const maxWidth = canvas.width * 0.8;
      const lineHeight = 60;
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;

      // Scale text position based on video size
      const x = (textPosition.x / video.clientWidth) * canvas.width;
      const y = (textPosition.y / video.clientHeight) * canvas.height;

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
        const url = URL.createObjectURL(blob);
        onCapture({ type: "image", url });
        clearOverlay();
        onClose();
      },
      "image/jpeg",
      1
    );
  };

  const getDurationMs = () => {
    switch (duration) {
      case "15s":
        return 15000;
      case "30s":
        return 30000;
      case "60s":
        return 60000;
      case "2m":
        return 120000;
      default:
        return 15000;
    }
  };

  const handleStartRecording = () => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    const durationMs = getDurationMs();
    const startTime = Date.now();

    recorder.ondataavailable = (e) => e.data && chunks.push(e.data);
    recorder.onstop = () => {
      clearInterval(recordIntervalRef.current);
      setRecordTimer(0);

      if (chunks.length === 0) return console.error("No video data captured.");
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      onCapture({ type: "video", url });
      setRecording(false);
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
        handleStopRecording();
      }
    }, 200);
  };

  const handleStopRecording = () => {
    clearInterval(recordIntervalRef.current);
    mediaRecorderRef.current?.stop();
  };

  const handleRecord = () => {
    if (mode === "photo") {
      if (timerActive) return;
      startTimer();
    } else {
      recording ? handleStopRecording() : handleStartRecording();
    }
  };

  const startTimer = () => {
    setTimerActive(true);
    let sec = 3;
    setCountdown(sec);
    const interval = setInterval(() => {
      sec--;
      setCountdown(sec);
      if (sec === 0) {
        clearInterval(interval);
        setTimerActive(false);
        handleCapturePhoto();
      }
    }, 1000);
  };

  // const handlePickMusic = async () => {
  //   const selected = await mockPickMusic();
  //   if (selected) setMusic(selected);
  // };

  // Drag text overlay
  const handleDragStart = (e) => {
    const startX = e.clientX || e.touches?.[0]?.clientX;
    const startY = e.clientY || e.touches?.[0]?.clientY;
    const offsetX = startX - textPosition.x;
    const offsetY = startY - textPosition.y;

    const handleMove = (moveEvent) => {
      const moveX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      const moveY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
      setTextPosition({
        x: moveX - offsetX,
        y: moveY - offsetY,
      });
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
  };

  // Crop only when user clicks Crop button
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video") ? "video" : "image";
    if (type === "image") {
      setImageToCrop(url);
      setCropMode(true);
    } else {
      onCapture({ type, url });
      clearOverlay();
      onClose();
    }
  };

  const createCroppedImage = async () => {
    const image = await createImage(imageToCrop);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return console.error("Crop blob is null");
      const url = URL.createObjectURL(blob);
      onCapture({ type: "image", url });
      setCropMode(false);
      setImageToCrop(null);
      clearOverlay();
      onClose();
    }, "image/jpeg");
  };

  if (!isOpen) return null;

  // Crop UI
  if (cropMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50">
        <div className="relative w-full h-[90vh] flex items-center justify-center">
          <div className="w-[90%] h-[90%] relative">
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
        </div>
        <div className="flex gap-4 mt-5">
          <button
            onClick={() => {
              setCropMode(false);
              setImageToCrop(null);
            }}
            className="bg-gray-600 px-6 py-2 rounded-full text-white"
          >
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            className="bg-lily hover:bg-lily px-6 py-2 rounded-full text-black font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={mode === "photo"}
        className="w-full h-full object-cover absolute top-0 left-0"
      />

      {timerActive && (
        <div className="absolute text-white text-7xl font-bold z-30 animate-pulse">
          {countdown}
        </div>
      )}

      {recording && (
        <div className="absolute top-15 left-1/2 -translate-x-1/2 text-red-500 text-lg font-semibold bg-black/60 px-3 py-1 rounded-full z-30">
          {new Date(recordTimer).toISOString().substr(14, 5)} / {duration}
        </div>
      )}

      {overlayText && (
        <div
          className="absolute z-20 text-white font-bold text-3xl drop-shadow-lg cursor-move select-none text-center max-w-[80%] break-words"
          style={{
            left: textPosition.x,
            top: textPosition.y,
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {overlayText}
        </div>
      )}

      {/* Top Controls */}
      {uiVisible && !textMode && (
        <div className="absolute top-4 w-full flex justify-between px-5 items-center text-white z-10">
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>

          <button
            className="bg-gray-800/80 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
          >
            🎵 coming soon
          </button>

          <button onClick={handleFlip}>
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Right Tools */}
      {uiVisible && !textMode && (
        <div className="absolute right-3 top-1/4 flex flex-col gap-5 text-white z-10">
          <button onClick={() => setTextMode(true)}>
            <Type className="w-6 h-6" />
            <span className="text-xs mt-1">Text</span>
          </button>
          <button onClick={startTimer}>
            <Timer className="w-6 h-6" />
            <span className="text-xs mt-1">Timer</span>
          </button>
          <button onClick={() => setCropMode(true)}>
            <Crop className="w-6 h-6" />
            <span className="text-xs mt-1">Crop</span>
          </button>
          <button onClick={() => alert("Filters feature coming soon")}>
            <Sparkles className="w-6 h-6" />
            <span className="text-xs mt-1">Filters</span>
          </button>
        </div>
      )}

      {/* Text Input */}
      {textMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30 px-6">
          <textarea
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            placeholder="Add text..."
            className="w-full max-w-md text-center bg-transparent border-none text-white text-2xl font-semibold focus:outline-none resize-none"
          />
          <button
            onClick={() => setTextMode(false)}
            className="mt-5 bg-lily hover:bg-lily text-white px-5 py-2 rounded-full flex items-center gap-2"
          >
            <Check className="w-5 h-5" /> Done
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      {!textMode && (
        <div className="absolute bottom-10 flex flex-col items-center w-full z-10">
          <div className="flex gap-6 mb-3 text-gray-300">
            {["15s", "30s", "60s", "2m"].map((t) => (
              <button
                key={t}
                onClick={() => setDuration(t)}
                className={`text-sm ${
                  duration === t ? "text-white font-semibold underline" : ""
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-10 ml-15">
            <button
              onClick={handleRecord}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition ${
                recording ? "border-red-600 bg-red-600" : "border-white"
              }`}
            >
              {mode === "photo" ? (
                <Camera className="w-10 h-10 text-white" />
              ) : (
                <Video className="w-10 h-10 text-white" />
              )}
            </button>

            <label>
              <Upload className="w-7 h-7 text-gray-200 cursor-pointer" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            {["photo", "video"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`capitalize ${
                  mode === m ? "text-white font-bold" : "text-gray-400"
                }`}
              >
                {m}
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

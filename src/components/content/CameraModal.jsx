import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

// In-app camera (photo + video) modal
function CameraRecorderModal({ open, onClose, onAddMedia }) {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [mode, setMode] = useState("photo"); // 'photo' | 'video'
  const [error, setError] = useState("");

  const stopStream = useCallback(() => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const init = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: mode === "video",
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error(e);
      if (e.name === "NotAllowedError") {
        setError("Camera access was denied. Please enable it in your browser settings.");
      } else if (e.name === "NotFoundError") {
        setError("No camera found. Please make sure a camera is connected and enabled.");
      } else {
        setError("Cannot access camera. Please check browser permissions.");
      }
    }
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    init();
    return () => {
      stopStream();
    };
  }, [open, init, stopStream]);

  const handlePhoto = (file) => {
    const url = URL.createObjectURL(file);
    if (onAddMedia) {
      onAddMedia({
        previewUrl: url,
        type: "photo",
        file,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || (video.readyState !== 4 && video.readyState !== 2)) {
      setError("Camera is not ready.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Failed to capture photo.");
        return;
      }
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      handlePhoto(file);
    }, "image/jpeg");
  };

  const startRecording = () => {
    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `recording_${Date.now()}.webm`, {
        type: "video/webm",
      });

      onAddMedia({
        previewUrl: URL.createObjectURL(file),
        type: "video",
        file,
      });

      onClose(); // Add this line to close modal
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mr.stop();
    setRecording(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 grid place-items-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex gap-2 text-sm">
            <button
              className={`px-3 py-1 rounded ${
                mode === "photo" ? "bg-lily text-white" : "bg-gray-100"
              }`}
              onClick={() => setMode("photo")}
              disabled={recording}>
              Photo
            </button>
            <button
              className={`px-3 py-1 rounded ${
                mode === "video" ? "bg-lily text-white" : "bg-gray-100"
              }`}
              onClick={() => setMode("video")}
              disabled={recording}>
              Video
            </button>
          </div>
          <button className="text-sm" onClick={() => onClose()}>
            Close
          </button>
        </div>
        {error && <div className="px-4 py-2 text-red-600 text-sm">{error}</div>}

        <div className="p-4">
          <video ref={videoRef} className="w-full rounded bg-black" playsInline muted autoPlay />

          {mode === "photo" ? (
            <>
              <div className="flex justify-center mt-4">
                <button className="px-5 py-2 rounded-full bg-lily text-white" onClick={takePhoto}>
                  Take Photo
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-center mt-4 gap-3">
              {!recording ? (
                <button
                  className="px-5 py-2 rounded-full bg-lily text-white"
                  onClick={startRecording}>
                  Start Recording
                </button>
              ) : (
                <button
                  className="px-5 py-2 rounded-full bg-red-600 text-white"
                  onClick={stopRecording}>
                  Stop Recording
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CameraRecorderModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddMedia: PropTypes.func.isRequired,
};

export default CameraRecorderModal;

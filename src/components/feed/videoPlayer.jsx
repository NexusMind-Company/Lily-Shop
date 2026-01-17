import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const VideoPlayer = ({ src, poster, onVideoInit, isActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Pass the video ref back to the parent (FeedContainer)
  // This allows the feed to auto-play/pause based on scroll position
  useEffect(() => {
    if (onVideoInit && videoRef.current) {
      onVideoInit(videoRef.current);
    }
  }, [onVideoInit]);

  // Handle Play/Pause Toggle on Tap
  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play()
        .then(() => {
          setIsPlaying(true);
          setShowControls(false); // Hide controls immediately on play
        })
        .catch((err) => console.error("Play failed:", err));
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true); // Show play button when paused
    }
  };

  // Sync state with actual video events
  // This handles cases where the FeedContainer (IntersectionObserver) plays/pauses the video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setShowControls(false);
    };

    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full bg-black cursor-pointer" 
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={false} // Starts with sound ON
      />

      {/* Play/Pause Overlay Button */}
      {/* Only visible when paused or explicitly toggled */}
      {(!isPlaying || showControls) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm p-5 rounded-full text-white transition-transform transform scale-100">
            {isPlaying ? (
              <FaPause className="w-8 h-8" />
            ) : (
              <FaPlay className="w-8 h-8 pl-1" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
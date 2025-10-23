import  {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFeed } from "../../context/feedContext";
import { Play, Pause, VolumeX, Volume2 } from "lucide-react";

const formatTime = (time) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const VideoPlayer = forwardRef(function VideoPlayer({ src }, ref) {
  const { isMuted, toggleMute } = useFeed();
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current?.play().catch(() => {});
    },
    pause: () => {
      videoRef.current?.pause();
    },
    getDOMNode: () => {
      return videoRef.current;
    },
  }));

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(videoNode.currentTime);
    const onLoadedMetadata = () => setDuration(videoNode.duration);
    videoNode.addEventListener("play", onPlay);
    videoNode.addEventListener("pause", onPause);
    videoNode.addEventListener("timeupdate", onTimeUpdate);
    videoNode.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      videoNode.removeEventListener("play", onPlay);
      videoNode.removeEventListener("pause", onPause);
      videoNode.removeEventListener("timeupdate", onTimeUpdate);
      videoNode.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  const handlePlayerClick = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      videoRef.current.currentTime = parseFloat(e.target.value);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        onClick={handlePlayerClick}
      >
        {!isPlaying && (
          <div className="relative">
            <div className="bg-black/50 rounded-full p-4">
              <Play size={60} className="text-white" fill="white" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute -top-1 -right-1 bg-white text-black rounded-full p-2 shadow-lg"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4 text-white">
          <button onClick={handlePlayerClick}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <span className="text-xs font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="text-xs font-mono">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;


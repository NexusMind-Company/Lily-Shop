import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFeed } from "../../hooks/useFeed";
import { Swiper, SwiperSlide } from "swiper/react";
import { Play, VolumeX, Volume2 } from "lucide-react";

import "swiper/css";

const CarouselVideoPlayer = ({ src, poster, onVideoInit }) => {
  const { isMuted, toggleMute } = useFeed();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      onVideoInit(videoRef.current);
    }
  }, [onVideoInit]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    videoNode.addEventListener("play", onPlay);
    videoNode.addEventListener("pause", onPause);
    return () => {
      videoNode.removeEventListener("play", onPlay);
      videoNode.removeEventListener("pause", onPause);
    };
  }, []);

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current?.paused) videoRef.current?.play();
    else videoRef.current?.pause();
  };

  return (
    <div className="relative w-full h-full bg-black" onClick={handlePlayPause}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {!isPlaying && (
          <div className="relative pointer-events-auto">
            <div className="rounded-full p-3">
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
    </div>
  );
};

const MediaCarousel = forwardRef(function MediaCarousel(
  { media, isFeedCarousel = false, containerClassName, onDoubleClick },
  ref,
) {
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    play: () => {
      const swiper = containerRef.current?.swiper;
      if (swiper) {
        const currentVideo = videoRefs.current[swiper.realIndex];
        if (currentVideo && currentVideo.paused) {
          currentVideo.play().catch(() => {});
        }
      }
    },
    pause: () => {
      const swiper = containerRef.current?.swiper;
      if (swiper) {
        const currentVideo = videoRefs.current[swiper.realIndex];
        if (currentVideo) {
          currentVideo.pause();
        }
      }
    },
    getDOMNode: () => {
      return containerRef.current;
    },
  }));

  const handleSlideChange = (swiper) => {
    if (!isFeedCarousel) return;
    const prevVideo = videoRefs.current[swiper.previousRealIndex];
    if (prevVideo) {
      prevVideo.pause();
      prevVideo.currentTime = 0;
    }
    const currentVideo = videoRefs.current[swiper.realIndex];
    if (currentVideo) {
      currentVideo.play().catch(() => console.log("Autoplay was prevented."));
    }
  };

  const finalContainerClass = `relative group ${
    containerClassName || "w-full h-full"
  }`;

  return (
    <div
      ref={containerRef}
      className={finalContainerClass}
      onDoubleClick={onDoubleClick}
    >
      <Swiper
        modules={[]}
        slidesPerView={1}
        spaceBetween={0}
        loop={media.length > 1}
        onSlideChange={(swiper) => {
          handleSlideChange(swiper);
          setActiveIndex(swiper.realIndex);
        }}
        onSwiper={(swiper) => {
          if (containerRef.current) {
            containerRef.current.swiper = swiper;
          }
          handleSlideChange(swiper);
          setActiveIndex(swiper.realIndex);
        }}
        className="w-full h-full"
      >
        {media.map((item, index) => (
          <SwiperSlide key={index} className="bg-black">
            {item.type === "video" ? (
              <CarouselVideoPlayer
                src={item.src}
                poster={item.poster}
                onVideoInit={(videoEl) => {
                  videoRefs.current[index] = videoEl;
                }}
              />
            ) : (
              <img
                src={item.src}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {media.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {media.map((_, index) => (
            <div
              key={index}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? "w-3 h-3 bg-white"
                  : "w-2 h-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default MediaCarousel;

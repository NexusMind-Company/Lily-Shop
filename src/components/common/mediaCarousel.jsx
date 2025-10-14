import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFeed } from "../../context/feedContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  VolumeX,
  Volume2,
} from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  { media, isFeedCarousel = false, containerClassName },
  ref
) {
  const containerRef = useRef(null); // Ref for the new outer container
  const videoRefs = useRef({});

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
      return containerRef.current; // Observer that watches the container
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
      currentVideo
        .play()
        .catch((error) => console.log("Autoplay was prevented."));
    }
  };

  const finalContainerClass = `relative group ${
    containerClassName || "w-full h-full"
  }`;

  return (
    // This is the outer container that controls the size and shape (e.g., aspect-square).
    <div ref={containerRef} className={finalContainerClass}>
      {/* The Swiper component is now inside, and will always fill this container. */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        loop={media.length > 1}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        onSlideChange={handleSlideChange}
        onInit={(swiper) => {
          // Link the swiper instance to the container's ref for the imperative handle
          if (containerRef.current) {
            containerRef.current.swiper = swiper;
          }
          handleSlideChange(swiper);
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
        <>
          <div className="swiper-button-prev absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-black/40 rounded-full p-1 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={28} />
          </div>
          <div className="swiper-button-next absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-black/40 rounded-full p-1 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={28} />
          </div>
        </>
      )}
    </div>
  );
});

export default MediaCarousel;

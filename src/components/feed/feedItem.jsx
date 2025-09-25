import React, { useState, useRef } from "react";
import { BsHeartFill, BsShareFill, BsPause, BsPlay } from "react-icons/bs";
import { Link } from "react-router";

const FeedItem = ({ post }) => {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(post.mediaUrl);
  const isUserPic = /\.(jpe?g|gif|png|webp|bmp|tiff?)$/i.test(post.userpic);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  const handleDoubleClick = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      3;
    } else {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  // Double Glory, Purple

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetaData = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current && duration > 0) {
      const rect = e.target.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = Math.max(
        0,
        Math.min((clickX / width) * duration, duration)
      );

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes} : ${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden"
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => isVideo && setShowControls(true)}
      onMouseLeave={() => isVideo && setShowControls(false)}
      onTouchStart={() => isVideo && setShowControls(true)}
    >
      {/* Media (image or video) */}
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={post.mediaUrl}
            className="w-full h-full object-fit"
            autoPlay
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetaData}
          />
          {/* Video controls overlay */}
          {showControls && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button
                onClick={togglePlayPause}
                className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-opacity"
              >
                {isPlaying ? (
                  <BsPause className="size-8 text-white" />
                ) : (
                  <BsPlay className="size-8 text-white ml-1" />
                )}
              </button>
            </div>
          )}
          {/* progress bar */}
          {showControls && (
            <div className="absolute bottom-16 left-4 right-16 bg-black/50 rounded-lg p-2">
              <div className="flex items-center gap-2 text-white text-xs">
                <span className="min-w-[35px]">{formatTime(currentTime)}</span>
                <div
                  onClick={handleSeek}
                  className="flex-1 bg-gray-600 rounded-full h-1 cursor-pointer relative"
                >
                  <div
                    className="bg-white rounded-full h-1 transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  />
                </div>
                <span className="min-w-[35px]">{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <img
          src={post.mediaUrl}
          alt="post media"
          className="w-full h-full object-cover"
        />
      )}

      {/* Buy now button */}
      <Link
        to="/"
        className="absolute right-3 left-4 bottom-50 bg-white rounded-xl px-3 py-1 w-30 gap-1 items-center flex"
      >
        <img src="./bag.svg" alt="" className="" />
        <p className="font-poppins text-sm text-black font-semibold">Buy Now</p>
      </Link>

      {/* Overlay Content */}
      <div className="absolute bottom-20 left-4 right-20">
        <div className="flex gap-2 items-center">
          <div className="relative flex flex-col items-center">
            <div to="/" className="relative">
              {isUserPic ? (
                <img
                  src={post.userpic}
                  alt=""
                  className="size-12 rounded-full md:size-18"
                />
              ) : (
                <img
                  src="./profile-icon.svg"
                  alt=""
                  className="size-12 rounded-full md:size-18"
                />
              )}
              {/* Follow button positioned at bottom center of profile pic */}
              <Link
                to="/"
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
              >
                <img src="./add.svg" alt="" className="" />
              </Link>
            </div>
          </div>
          <h3 className="font-bold">{post.username}</h3>
        </div>
        <p className="text-sm font-medium mb-3">{post.caption}</p>
      </div>

      {/* Right-side action buttons */}
      <div className="absolute right-3 bottom-30 flex flex-col gap-4 items-center">
        <button
          onClick={handleDoubleClick}
          className="flex flex-col items-center"
        >
          <BsHeartFill className={`size-7 ${liked ? "text-red-500" : ""}`} />
          <span className="text-xs font-semibold font-poppins">
            {likeCount}
          </span>
        </button>
        <button className="flex flex-col items-center">
          <img src="./comment-icon.svg" alt="" />
          <span className="text-xs font-semibold font-poppins">
            {post.comments}
          </span>
        </button>
        <button className="flex flex-col items-center">
          <BsShareFill className="size-7" />
          <span className="text-xs font-semibold font-poppins">
            {post.shares}
          </span>
        </button>
        <button className="flex flex-col items-center">
          <img src="/message2-icon.svg" alt="" />
          <span className="text-xs font-semibold font-poppins">Message</span>
        </button>
        <button className="flex flex-col items-center">
          <img src="/feed-eyes.svg" alt="" />
          <span className="text-xs font-semibold font-poppins">
            {post.views}
          </span>
        </button>
      </div>
    </div>
  );
};

export default FeedItem;

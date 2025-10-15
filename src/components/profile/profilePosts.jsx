import { mockPosts } from "./mockData";

// Get user's shops from Redux profile slice

// Profile Body Component
const ProfilePosts = () => {
  return (
    <div className="w-full flex flex-wrap gap-[5px] justify-between py-1">
      {mockPosts.length === 0 ? (
        <div className="w-full text-center py-10 text-gray-400">
          No posts yet.
        </div>
      ) : (
        mockPosts.map((mockPost) => (
          <div
            key={mockPost.id}
            className="w-[32%] h-[200px] relative lg:h-[300px] lg:w-[33%] overflow-hidden bg-gray-100"
          >
            {/\.(mp4|webm|ogg)$/i.test(mockPost.mediaUrl) ? (
              <video
                src={mockPost.mediaUrl}
                className="w-full h-full object-cover"
                controls
                poster={mockPost.thumbnail}
              />
            ) : (
              <img
                src={mockPost.thumbnail}
                alt={mockPost.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-1 left-1 text-white font-semibold flex items-center gap-[3px]">
              <img src="./post eye.svg" alt="views icon" className="w-5 h-5" />
              <span title={mockPost.views}>{mockPost.views ? `${mockPost.views}k` : "0k"}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProfilePosts;
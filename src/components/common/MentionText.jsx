import React, { useState } from "react";
import MentionModal from "./MentionModal";

const MentionText = ({ text, className }) => {
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!text) return null;

  // Split text by mentions (@username)
  // We use a capture group to keep the mentions in the split parts
  const parts = text.split(/(@\w+)/g);

  const handleMentionClick = (e, username) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove the '@' prefix
    setSelectedUsername(username.substring(1));
    setIsModalOpen(true);
  };

  return (
    <>
      <span className={className}>
        {parts.map((part, index) => {
          if (part.startsWith("@") && part.length > 1) {
            return (
              <span
                key={index}
                className="text-lily font-bold cursor-pointer hover:underline"
                onClick={(e) => handleMentionClick(e, part)}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
      {isModalOpen && (
        <MentionModal
          username={selectedUsername}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default MentionText;


import PropTypes from "prop-types";
import { mockPickMusic } from "../utils/mockMusicPicker";
import { Music, X } from "lucide-react";
import { useState } from "react";

const MusicPicker = ({ selectedMusic, setSelectedMusic }) => {
  const [loading, setLoading] = useState(false);

  const handlePickMusic = async () => {
    setLoading(true);
    try {
      const selected = await mockPickMusic();
      if (selected) setSelectedMusic(selected);
    } catch (error) {
      console.error("Error selecting music:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setSelectedMusic(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-400">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 ">
          <Music className="w-5 h-5 text-lily" />
          <span className="font-medium ">Add Music</span>
        </div>

        {!selectedMusic ? (
          <button
            onClick={handlePickMusic}
            disabled={loading}
            className={` font-semibold ${
              loading
                ? "cursor-wait"
                : "text-lily hover:underline"
            }`}
          >
            {loading ? "Loading..." : "Pick Song"}
          </button>
        ) : (
          <button
            onClick={handlePickMusic}
            className=" text-lily hover:underline font-semibold"
          >
            Change
          </button>
        )}
      </div>

      {selectedMusic && (
        <div className="mt-3 flex items-center justify-between bg-gray-200 p-3 rounded-lg">
          <div>
            <p className="font-semibold ">
              {selectedMusic.name}
            </p>
            <p className=" ">{selectedMusic.artist}</p>
          </div>

          <button
            onClick={handleRemove}
            className="p-1 rounded-full hover:bg-gray-600 transition"
          >
            <X className="w-7 h-7 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
};

MusicPicker.propTypes = {
  selectedMusic: PropTypes.shape({
    name: PropTypes.string,
    artist: PropTypes.string,
  }),
  setSelectedMusic: PropTypes.func.isRequired,
};

export default MusicPicker;

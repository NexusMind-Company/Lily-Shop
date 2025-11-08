import PropTypes from "prop-types";
import { mockPickMusic } from "../utils/mockMusicPicker";
import { Music, X } from "lucide-react";
import { useState } from "react";

const MusicPicker = ({ selectedMusic, setSelectedMusic }) => {
  // const [loading, setLoading] = useState(false);

  // const handlePickMusic = async () => {
  //   setLoading(true);
  //   try {
  //     const selected = await mockPickMusic();
  //     if (selected) setSelectedMusic(selected);
  //   } catch (error) {
  //     console.error("Error selecting music:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleRemove = () => {
  //   setSelectedMusic(null);
  // };

  return (
    <div className="bg-white w-full p-4 rounded-lg border border-gray-400 text-center">
      <div className="flex items-center justify-between  ">
        <span className="font-medium flex items-center gap-2 "><Music className="w-5 h-5 text-lily" />Add Music</span>
        <p className="font-medium text-lily">pick song</p>
      </div>
      <span className="font-semibold text-lg text-gray-700">Coming Soon</span>
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

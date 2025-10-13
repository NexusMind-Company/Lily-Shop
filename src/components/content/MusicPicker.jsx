import { useState, useRef } from "react";
import PropTypes from "prop-types";

const MusicPicker = ({ onMusicChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  // Mocked LilyShops music library
  const musicLibrary = [
    {
      id: "1",
      name: "Blinding Lights",
      artist: "The Weeknd",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "2",
      name: "Levitating",
      artist: "Dua Lipa",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "3",
      name: "Watermelon Sugar",
      artist: "Harry Styles",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      id: "4",
      name: "Shape of You",
      artist: "Ed Sheeran",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
    {
      id: "5",
      name: "Dance Monkey",
      artist: "Tones and I",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    },
  ];

  const filteredTracks = musicLibrary.filter(
    (track) =>
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMusic = (track) => {
    setSelectedMusic(track);
    if (onMusicChange) {
      onMusicChange(track);
    }
    // Optionally, sync with video logic can be added here
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="music-picker bg-gray-100 border rounded p-4 shadow">
      <h2 className="text-xl font-bold mb-4">Add Music</h2>
      <input
        type="text"
        placeholder="Search for songs or artists..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <div className="space-y-4 mb-4">
        {filteredTracks.map((track) => (
          <div key={track.id} className="flex items-center bg-white rounded p-2 shadow">
            <div className="flex-1">
              <div className="font-semibold">{track.name}</div>
              <div className="text-sm text-gray-600">{track.artist}</div>
            </div>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => handleAddMusic(track)}>
              Add
            </button>
          </div>
        ))}
        {filteredTracks.length === 0 && <div className="text-gray-500">No songs found.</div>}
      </div>
      {selectedMusic && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <div className="font-semibold mb-2">
            Added: {selectedMusic.name} - {selectedMusic.artist}
          </div>
          <audio
            ref={audioRef}
            src={selectedMusic.url}
            controls
            volume={volume}
            style={{ width: "100%" }}
          />
          <label className="block mt-2">
            Volume:
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="ml-2"
            />
            <span className="ml-2">{Math.round(volume * 100)}%</span>
          </label>
        </div>
      )}
    </div>
  );
};

MusicPicker.propTypes = {
  selectedSong: PropTypes.string,
  onSongSelect: PropTypes.func.isRequired,
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      artist: PropTypes.string,
      url: PropTypes.string,
    })
  ).isRequired,
  videoUrl: PropTypes.string, // Add this line for videoUrl prop validation
  onMusicChange: PropTypes.func, // Add this line for onMusicChange prop validation
};

export default MusicPicker;

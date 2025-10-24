// src/utils/mockSpotifyPicker.js

// Simulates picking a song from Spotify or another music picker
export const mockPickMusic = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockSongs = [
        { name: "Blinding Lights", artist: "The Weeknd" },
        { name: "Calm Down", artist: "Rema" },
        { name: "Essence", artist: "Wizkid ft. Tems" },
        { name: "Unavailable", artist: "Davido ft. Musa Keys" },
        { name: "As It Was", artist: "Harry Styles" },
        { name: "Rush", artist: "Ayra Starr" },
      ];

      // Randomly pick one song
      const selectedSong =
        mockSongs[Math.floor(Math.random() * mockSongs.length)];

      resolve(selectedSong);
    }, 800); // Simulate a short delay
  });
};

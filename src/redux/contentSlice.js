import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  media: [],
  caption: "",
  nextId: 1,
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    addMedia: (state, action) => {
      const items = action.payload.map((item) => ({
        ...item,
        id: state.nextId++,
        previewUrl: URL.createObjectURL(item.file),
      }));
      state.media.push(...items);
    },
    removeMedia: (state, action) => {
      const id = action.payload;
      const index = state.media.findIndex((m) => m.id === id);
      if (index !== -1) {
        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(state.media[index].previewUrl);
        state.media.splice(index, 1);
      }
    },
    reorderMedia: (state, action) => {
      const order = action.payload;
      const reordered = order.map((id) => state.media.find((m) => m.id === id)).filter(Boolean);
      state.media = reordered;
    },
    clearMedia: (state) => {
      // Revoke all object URLs
      state.media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
      state.media = [];
    },
    setCaption: (state, action) => {
      state.caption = action.payload;
    },
  },
});

export const { addMedia, removeMedia, reorderMedia, clearMedia, setCaption } = contentSlice.actions;

export const selectCreateDraft = (state) => state.content;

export default contentSlice.reducer;

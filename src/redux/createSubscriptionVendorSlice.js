import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../services/supabase";
import { getCurrentUserId } from "../services/supabase";

// Async thunk to create a subscription vendor
export const createSubscriptionVendor = createAsyncThunk(
  "createSubscriptionVendor/createSubscriptionVendor",
  async (formData, { rejectWithValue }) => {
    try {
      let vendorId = getCurrentUserId();
      if (!vendorId) {
        // For testing purposes, use a dummy ID if not authenticated
        vendorId = "test-vendor-" + Date.now();
        console.warn("Using dummy vendor ID for testing:", vendorId);
      }

      // Extract text fields
      const vendorData = {
        id: vendorId, // Use current user ID as vendor ID
        name: formData.get("name"),
        cuisine: formData.get("cuisine"),
        location: formData.get("location"),
        description: formData.get("description"),
        contact_phone: formData.get("contactPhone"),
        contact_email: formData.get("contactEmail"),
        created_at: new Date().toISOString(),
      };

      // Handle image upload if present
      const imageFile = formData.get("image");
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `vendor-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        vendorData.image = publicUrl;
      }

      const { data, error } = await supabase
        .from("vendors")
        .insert(vendorData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

const createSubscriptionVendorSlice = createSlice({
  name: "createSubscriptionVendor",
  initialState: {
    status: "idle",
    error: null,
    success: false,
    vendorData: null,
  },
  reducers: {
    resetCreateSubscriptionVendorState: (state) => {
      state.status = "idle";
      state.error = null;
      state.success = false;
      state.vendorData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSubscriptionVendor.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.success = false;
      })
      .addCase(createSubscriptionVendor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.success = true;
        state.vendorData = action.payload;
      })
      .addCase(createSubscriptionVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error?.message ||
          "An unexpected error occurred";
      });
  },
});

export const { resetCreateSubscriptionVendorState } =
  createSubscriptionVendorSlice.actions;
export default createSubscriptionVendorSlice.reducer;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- USER & CART ---

// Fetch the user's default addresses
export const fetchUserProfile = async () => {
  // const res = await fetch('/api/user/profile');
  // return res.json();
  throw new Error("fetchUserProfile() not implemented");
};

// --- ADDRESSES ---

// Fetch list of saved delivery addresses
export const fetchDeliveryAddresses = async () => {
  // const res = await fetch('/api/user/addresses');
  // return res.json();
  throw new Error("fetchDeliveryAddresses() not implemented");
};

// Add new address
export const addNewAddress = async (addressData) => {
  // const res = await fetch('/api/user/addresses', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(addressData)
  // });
  // return res.json();
  throw new Error("addNewAddress() not implemented");
};

// --- PICKUP ---

// Fetch list of saved pickup locations
export const fetchPickupLocations = async () => {
  // const res = await fetch('/api/pickup-locations');
  // return res.json();
  throw new Error("fetchPickupLocations() not implemented");
};

// --- CARDS ---

// Fetch list of saved cards
export const fetchSavedCards = async () => {
  // const res = await fetch('/api/user/cards');
  // return res.json();
  throw new Error("fetchSavedCards() not implemented");
};

// Add new card
export const addNewCard = async (cardData) => {
  // const res = await fetch('/api/user/cards', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(cardData)
  // });
  // return res.json();
  throw new Error("addNewCard() not implemented");
};

// --- PAYMENT ---

// Initiate a bank transfer payment
export const initiateBankTransfer = async ({ amount, vendorName }) => {
  // const res = await fetch('/api/payment/initiate-bank-transfer', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, vendorName })
  // });
  // return res.json();
  throw new Error("initiateBankTransfer() not implemented");
};

// Check payment status
export const checkPaymentStatus = async (orderId) => {
  // const res = await fetch(`/api/payment/status/${orderId}`);
  // return res.json();
  throw new Error("checkPaymentStatus() not implemented");
};

// Verify user password for payment
export const verifyPaymentPassword = async (password) => {
  // const res = await fetch('/api/user/verify-password', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ password })
  // });
  // if (!res.ok) throw new Error("Invalid password");
  // return res.json();
  throw new Error("verifyPaymentPassword() not implemented");
};


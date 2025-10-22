import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useFeed } from "../../../context/feedContext";
import ProductItem from "./productItem";

// This can be in a separate api.js file, but for now it's here
const fetchProductById = async (id) => {
  const res = await fetch(
    `https://lily-shop-backend.onrender.com/shops/products/{id}/`
  );
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

const ProductDetails = () => {
  const { id } = useParams();
  const { posts } = useFeed(); // Get all posts from context

  //  First, try to find the product in the already-loaded feed data
  const productFromContext = posts.find((p) => String(p.id) === id);

  // Fallback to fetching if not found in context (e.g., direct navigation)
  const {
    data: productFromApi,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !productFromContext,
  });

  const product = productFromContext || productFromApi;

  if (isLoading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center mt-8">Error loading product.</p>;
  if (!product) return <p className="text-center mt-8">Product not found.</p>;

  return (
    <div className=" flex flex-col items-center">
      <ProductItem product={product} />
    </div>
  );
};

export default ProductDetails;

// Common UI Components
export { default as Button } from "./Button";
export { default as Card } from "./Card";
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
export { default as Icon, iconMap } from "./Icon";
export { default as DarkModeToggle } from "./DarkModeToggle";
export { default as LoadingSpinner, LoadingDots, LoadingPulse } from "./LoadingSpinner";
export { default as PageTransition, FadeTransition, SlideTransition } from "./PageTransition";
export { default as Header } from "./header";
export { default as ScrollToTop } from "./scrollToTop";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as RoleProtectedRoute } from "./RoleProtectedRoute";
export { default as ErrorDisplay } from "./ErrorDisplay";
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as PageSEO } from "./PageSEO";
export { default as SEO } from "./SEO";
export { default as Footer } from "./footer";
export { default as MediaCarousel } from "./mediaCarousel";
export { default as Skeletons } from "./skeletons";

// Re-export skeleton components for convenience
export {
  PostCardSkeleton,
  CommentSkeleton,
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
  SearchUserSkeleton,
  FeedSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  ProfileHeaderSkeleton,
} from "./skeletons";

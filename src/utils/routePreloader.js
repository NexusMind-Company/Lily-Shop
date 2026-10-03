/**
 * Route & Modal Preloader Utility
 * Speeds up page transitions and modal openings by prefetching code chunks
 * during browser idle time or on user interaction (hover/touch).
 */

const preloadedPaths = new Set();

const routeLoaders = {
  // Primary Tabs
  "/food": () => import("../pages/VendorsList"),
  "/profile": () => import("../pages/profile"),
  "/inbox": () => import("../pages/inbox"),
  "/cart": () => import("../pages/CartPage"),
  "/my-shop": () => import("../pages/myShop"),
  "/orders": () => import("../pages/OrderHistoryPage"),
  "/createContent": () => import("../components/content/CreatePost"),
  "/wallet": () => import("../pages/wallet"),
  "/activity": () => import("../pages/activity"),
  "/product": () => import("../pages/feedProductDetails"),
};

export const preloadRoute = (path) => {
  if (!path || typeof path !== "string") return;

  const baseSegment = "/" + path.replace(/^\//, "").split("/")[0];
  const loader = routeLoaders[path] || routeLoaders[baseSegment];

  if (loader && !preloadedPaths.has(baseSegment)) {
    preloadedPaths.add(baseSegment);
    try {
      loader();
    } catch {
      // Gracefully ignore background preload errors
    }
  }
};

export const initIdlePreloader = () => {
  if (typeof window === "undefined") return () => {};

  const preloadPrimary = () => {
    preloadRoute("/food");
    preloadRoute("/profile");
    preloadRoute("/inbox");
    preloadRoute("/cart");
    preloadRoute("/my-shop");
    preloadRoute("/orders");
  };

  const preloadSecondary = () => {
    preloadRoute("/activity");
    preloadRoute("/wallet");
    preloadRoute("/createContent");
    preloadRoute("/product");
  };

  if ("requestIdleCallback" in window) {
    const primaryId = window.requestIdleCallback(preloadPrimary, { timeout: 2000 });
    const secondaryTimer = setTimeout(() => {
      window.requestIdleCallback(preloadSecondary, { timeout: 4000 });
    }, 2500);

    return () => {
      window.cancelIdleCallback(primaryId);
      clearTimeout(secondaryTimer);
    };
  } else {
    const t1 = setTimeout(preloadPrimary, 1200);
    const t2 = setTimeout(preloadSecondary, 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }
};

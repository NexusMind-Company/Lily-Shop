const FLOW_STORAGE_KEY = "lily_pending_subscription_data";
const SUCCESS_STORAGE_KEY = "lily_subscription_success_data";

const readJson = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.sessionStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error(
      `Failed to parse stored subscription data for ${key}:`,
      error,
    );
    window.sessionStorage.removeItem(key);
    return null;
  }
};

const writeJson = (key, value) => {
  if (typeof window === "undefined" || !value) return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
};

const mergeState = (primaryState, fallbackState) => {
  const mergedState = {
    ...(fallbackState ?? {}),
    ...(primaryState ?? {}),
  };

  return Object.keys(mergedState).length > 0 ? mergedState : null;
};

export const getSubscriptionFlowState = () => readJson(FLOW_STORAGE_KEY);

export const resolveSubscriptionFlowState = (state) =>
  mergeState(state, getSubscriptionFlowState());

export const saveSubscriptionFlowState = (state) => {
  const mergedState = resolveSubscriptionFlowState(state);
  if (mergedState) {
    writeJson(FLOW_STORAGE_KEY, mergedState);
  }
  return mergedState;
};

export const clearSubscriptionFlowState = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(FLOW_STORAGE_KEY);
  window.sessionStorage.removeItem("lily_subscription_redirect");
};

export const getSubscriptionSuccessState = () => readJson(SUCCESS_STORAGE_KEY);

export const resolveSubscriptionSuccessState = (state) =>
  mergeState(state, getSubscriptionSuccessState());

export const saveSubscriptionSuccessState = (state) => {
  const mergedState = resolveSubscriptionSuccessState(state);
  if (mergedState) {
    writeJson(SUCCESS_STORAGE_KEY, mergedState);
  }
  return mergedState;
};

export const clearSubscriptionSuccessState = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SUCCESS_STORAGE_KEY);
};

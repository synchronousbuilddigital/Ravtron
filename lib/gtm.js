import { sendGTMEvent } from "@next/third-parties/google";

/**
 * Google Tag Manager helper utility
 * Pushes events to window.dataLayer
 */
export const pushToDataLayer = (data) => {
  if (typeof window !== "undefined") {
    sendGTMEvent(data);
  }
};

/**
 * Standard E-commerce & interaction helper events
 */
export const trackEvent = (eventName, params = {}) => {
  pushToDataLayer({
    event: eventName,
    ...params,
  });
};

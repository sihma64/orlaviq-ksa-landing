type TrackingEventName =
  | "ViewContent"
  | "SelectOffer"
  | "OrderFormSubmit"
  | "WhatsAppConfirmClick"
  | "OrderRejected"
  | "OrderGuardError";

type TrackingParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (method: string, eventName: string, params?: TrackingParams) => void;
    ttq?: {
      track?: (eventName: string, params?: TrackingParams) => void;
    };
    snaptr?: (method: string, eventName: string, params?: TrackingParams) => void;
  }
}

export function trackEvent(eventName: TrackingEventName, params: TrackingParams = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event: eventName,
    ...params,
  };

  console.log("[ORLAVIQ Tracking]", payload);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params);
  }

  if (window.ttq?.track) {
    window.ttq.track(eventName, params);
  }

  if (typeof window.snaptr === "function") {
    window.snaptr("track", eventName, params);
  }
}
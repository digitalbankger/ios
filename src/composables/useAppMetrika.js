export function useAppMetrika() {
  const isReady = typeof window !== 'undefined' && window.AppMetrica;

  const init = () => {
    if (import.meta.env.PROD && isReady) {
      window.AppMetrica.activate({
        apiKey: '06ff5e88-55fb-4386-a50c-35a7964a9046',
        sessionTimeout: 120,
        appVersion: '1.0.0',
        locationTracking: true,
        logs: true,
      });
    }
  };

  const sendEvent = (eventName, params = {}) => {
    if (import.meta.env.PROD && isReady) {
      window.AppMetrica.reportEvent(eventName, params);
    } else {
      console.log(`[AppMetrika Debug] Событие: ${eventName}`, params);
    }
  };

  return {
    init,
    sendEvent,
  };
}

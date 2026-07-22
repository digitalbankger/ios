export function openExternalUrl(url) {
  if (!url) return;

  if (window.cordova?.InAppBrowser) {
    window.cordova.InAppBrowser.open(url, "_system");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

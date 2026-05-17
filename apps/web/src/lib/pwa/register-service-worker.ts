import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) {
    return;
  }

  const worker = new Workbox(`${import.meta.env.BASE_URL}sw.js`);

  worker.addEventListener('waiting', () => {
    window.dispatchEvent(new CustomEvent('bagyo-rescue:update-ready'));
  });

  worker.addEventListener('controlling', () => {
    window.location.reload();
  });

  worker.register();
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // First check if a service worker is already controlling this page
      if (navigator.serviceWorker.controller) {
        console.log('Service Worker is already active.');
      } else {
        // Attempt to register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully:', registration);
        
        // Add event listeners for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Service Worker update found!');
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('Service Worker state changed to:', newWorker.state);
            });
          }
        });
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
  
  // Listen for service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed.');
  });
}

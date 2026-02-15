// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
    apiKey: "AIzaSyAAm9oyGu8kWANd8QN49-RMWgX5d9d6YoE",
    authDomain: "academia-vqc.firebaseapp.com",
    projectId: "academia-vqc",
    storageBucket: "academia-vqc.firebasestorage.app",
    messagingSenderId: "965989150400",
    appId: "1:965989150400:web:0af7f4efeed23019850725",
    measurementId: "G-1Q8WG9W314"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

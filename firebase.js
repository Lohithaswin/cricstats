// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjcHKvSzR1D27Eus3Qzh9r0SsRzy3bDE4",
  authDomain: "cricstat-a03b9.firebaseapp.com",
  databaseURL: "https://cricstat-a03b9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cricstat-a03b9",
  storageBucket: "cricstat-a03b9.firebasestorage.app",
  messagingSenderId: "377495967902",
  appId: "1:377495967902:web:9f6781756714f02894c38f",
  measurementId: "G-JPEMDD35SE"
};

// Initialize Firebase with error handling
try {
  if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.database();
  window.db = db;

  // Add database connection status listener
  const connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
          console.log("Connected to Firebase");
      } else {
          console.log("Disconnected from Firebase");
      }
  });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'status-message error';
  errorDiv.textContent = 'Error connecting to database. Please try again later.';
  document.body.appendChild(errorDiv);
}


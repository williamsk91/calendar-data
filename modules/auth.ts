import "firebase/auth";

import firebase from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyAdGYvQXLRPqEqbAd9MZO8yt_K98Z-KvDg",
  authDomain: "calendar-data-a29d6.firebaseapp.com",
  projectId: "calendar-data-a29d6",
  storageBucket: "calendar-data-a29d6.appspot.com",
  messagingSenderId: "31531774894",
  appId: "1:31531774894:web:cfe04fe32ba2be7544ce3f",
  measurementId: "G-7X7M8DYLEE",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

export const fb = firebase;

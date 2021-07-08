import Script from "next/script";
import { useEffect, useState } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

import { fb } from "../modules/auth";

declare var gapi: any;

const uiConfig: firebaseui.auth.Config = {
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: "/signedIn",
  // We will display Google and Facebook as auth providers.
  signInOptions: [fb.auth.GoogleAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
  tosUrl: "/terms-and-serice-url",
  privacyPolicyUrl: "/privacy-policy-url",
};

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  // 1. Load the JavaScript client library.
  const initGapi = () => {
    console.log("init");
    gapi.load("client", async () => {
      console.log("loaded client");

      await gapi.client.init({
        apiKey: "AIzaSyAdGYvQXLRPqEqbAd9MZO8yt_K98Z-KvDg",
        // Your API key will be automatically added to the Discovery Document URLs.
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
        // clientId and scope are optional if auth is not required.
        clientId:
          "31531774894-hanmdu5aqo0dqj4hgo3e8h4sa1bs8uio.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/calendar.readonly",
      });

      const GoogleAuth = gapi.auth2.getAuthInstance();
      setIsSignedIn(GoogleAuth.isSignedIn);

      gapi.client.load("calendar", "v3", () => console.log("loaded calendar"));
    });
  };

  const signIn = async () => {
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();

    const token = googleUser.getAuthResponse().id_token;

    const credential = fb.auth.GoogleAuthProvider.credential(token);
    await fb.auth().signInWithCredential(credential);
    setIsSignedIn(true);
  };

  const signOut = async () => {
    const googleAuth = gapi.auth2.getAuthInstance();
    await googleAuth.signOut();
    setIsSignedIn(false);
  };

  const getCalendar = async () => {
    const events = await gapi.client.calendar.events.list({
      calendarId: "sephereus9@gmail.com",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    });
    console.log("events: ", events);
  };

  return (
    <div>
      <Script src="https://apis.google.com/js/api.js" onLoad={initGapi} />

      {isSignedIn ? (
        <div>
          <div>{fb.auth().currentUser?.displayName}</div>
          <a onClick={signOut}>Sign-out</a>
        </div>
      ) : (
        <button onClick={signIn}>sign in</button>
      )}

      <button onClick={getCalendar}>get calendar</button>
    </div>
  );
}

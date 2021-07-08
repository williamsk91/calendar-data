import Script from "next/script";
import { useState } from "react";

import { eventsToWeekTotal, getWeekEvents } from "../data/calendar";
import { fb } from "../modules/auth";

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
      setIsSignedIn(GoogleAuth.isSignedIn.get());

      gapi.client.load("calendar", "v3", () => console.log("loaded calendar"));
    });
  };

  const signIn = async () => {
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();

    // connect to firebase
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
    const events = await getWeekEvents(new Date());
    console.log("events: ", events);

    const weekTotal = eventsToWeekTotal(events);
    console.log("weekTotal: ", weekTotal);
  };

  return (
    <div>
      <Script src="https://apis.google.com/js/api.js" onLoad={initGapi} />

      <div>
        {isSignedIn ? (
          <div>
            <div>{fb.auth().currentUser?.displayName}</div>
            <button onClick={signOut}>Sign-out</button>
          </div>
        ) : (
          <button onClick={signIn}>sign in</button>
        )}
      </div>

      <button onClick={getCalendar}>get calendar</button>
    </div>
  );
}

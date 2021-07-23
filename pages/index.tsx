import Script from "next/script";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { CalendarInfo, CalendarList } from "../component/CalendarList";
import { TagPercentageChart } from "../component/TagPercentageChart";
import { WeekTotalChart } from "../component/WeekTotalChart";
import {
  TagPercentage,
  WeekTotal,
  calendarListEntryToCalendar,
  eventsToWeekTotal,
  getCalendarLists,
  getMultipleRangeEvents,
  getRangeEvents,
  weekTotalToTagPercentage,
} from "../data/calendar";
import { getCurrentWeekRange } from "../data/date";
import { fb } from "../modules/auth";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  const [calendarsInfo, setCalendarsInfo] = useState<CalendarInfo[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string[]>([]);

  // 1. Load the JavaScript client library.
  const initGapi = () => {
    gapi.load("client", async () => {
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

      gapi.client.load("calendar", "v3", () => {
        console.log("loaded calendar");
      });
    });
  };

  useEffect(() => {
    isSignedIn && getUserCalendarList();
  }, [isSignedIn]);

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
    setCalendarsInfo([]);
    setSelectedCalendar([]);

    setWeekTotal([]);
    setTagPercentage([]);
  };

  const [weekTotal, setWeekTotal] = useState<WeekTotal[]>([]);
  const [tagPercentage, setTagPercentage] = useState<TagPercentage[]>([]);

  const getUserCalendarList = async () => {
    const calList = await getCalendarLists();
    const calInfos = calList.map(calendarListEntryToCalendar);
    setCalendarsInfo(calInfos);
    setSelectedCalendar(calInfos.map((ci) => ci.id));
  };

  const getCalendar = async () => {
    const weekRange = getCurrentWeekRange();
    const events = await getMultipleRangeEvents(
      selectedCalendar,
      weekRange[0],
      weekRange[1]
    );

    const weekTotal = eventsToWeekTotal(events);
    setWeekTotal(weekTotal);

    const tagPercentage = weekTotalToTagPercentage(weekTotal);
    setTagPercentage(tagPercentage);
  };

  return (
    <Layout>
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

      <CalendarList
        calendars={calendarsInfo}
        selected={selectedCalendar}
        onChange={(newValue) => {
          setSelectedCalendar(newValue);
        }}
      />

      <button onClick={getCalendar}>get calendar</button>
      <br />
      <Label>Weekly Hours</Label>
      <WeekTotalChart data={weekTotal} />
      <TagPercentageChart data={tagPercentage} />
    </Layout>
  );
}

const Layout = styled.div`
  max-width: 960px;
  margin: 60px auto;
  padding: 60px;
  box-sizing: border-box;
`;

// Typography
const H1 = styled.h1``;
const H2 = styled.h2``;
const H3 = styled.h3``;
const Label = styled.span``;
const p = styled.h3``;

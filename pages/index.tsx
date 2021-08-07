import Script from "next/script";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { AuthButton } from "../component/AuthButton";
import { CheckboxGroup } from "../component/CheckboxGroup";
import { RefreshButton } from "../component/RefreshButton";
import { Tag } from "../component/Tag";
import { TagPercentageChart } from "../component/TagPercentageChart";
import { WeekPicker } from "../component/WeekPicker";
import { WeekTotalChart } from "../component/WeekTotalChart";
import {
  CalendarInfo,
  TagPercentage,
  WeekTotal,
  calendarListEntryToCalendar,
  eventsToWeekTotal,
  getCalendarLists,
  getMultipleRangeEvents,
  weekTotalToTagPercentage,
} from "../data/calendar";
import { getWeekRange } from "../data/date";
import { fb } from "../modules/auth";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  const [weekRange, setWeekRange] = useState(getWeekRange());

  const [calendarsInfo, setCalendarsInfo] = useState<CalendarInfo[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string[]>([]);

  const [tagsInfo, setTagsInfo] = useState<Tag[]>([]);
  const [selectedTags, setselectedTags] = useState<string[]>([]);

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
    setTagsInfo([]);
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
    const events = await getMultipleRangeEvents(
      selectedCalendar,
      weekRange[0],
      weekRange[1]
    );

    const weekTotal = eventsToWeekTotal(events);
    setWeekTotal(weekTotal);

    const tags = weekTotal.map((wt) => wt.tag);
    setTagsInfo(tags);
    setselectedTags(tags.map((t) => t.title));

    const tagPercentage = weekTotalToTagPercentage(weekTotal);
    setTagPercentage(tagPercentage);
  };

  return (
    <Layout>
      <Script src="https://apis.google.com/js/api.js" onLoad={initGapi} />

      <AuthButton isSignedIn={isSignedIn} signIn={signIn} signOut={signOut} />

      <div>Calendars</div>
      <CheckboxGroup
        data={calendarsInfo}
        selected={selectedCalendar}
        onChange={setSelectedCalendar}
      />

      <WeekPicker
        week={weekRange[0]}
        onChange={(date) => setWeekRange(getWeekRange(date))}
      />

      <RefreshButton onClick={getCalendar} />
      <div>Tags</div>
      <CheckboxGroup
        data={tagsInfo.map(({ title, color }) => ({ title, id: title, color }))}
        selected={selectedTags}
        onChange={setselectedTags}
      />

      <div>Weekly Hours</div>
      <WeekTotalChart
        data={weekTotal.filter((wt) => selectedTags.includes(wt.tag.title))}
      />
      <div>Weekly Percentage</div>
      <TagPercentageChart
        data={tagPercentage.filter((wt) => selectedTags.includes(wt.tag.title))}
      />
    </Layout>
  );
}

const Layout = styled.div`
  max-width: 960px;
  margin: 60px auto;
  padding: 60px;
  box-sizing: border-box;
`;

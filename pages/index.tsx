import Script from "next/script";
import { useState } from "react";
import styled from "styled-components";

import { AuthButton } from "../component/AuthButton";
import { CheckboxGroup } from "../component/CheckboxGroup";
import { RefreshButton } from "../component/RefreshButton";
import { Spacer } from "../component/Spacer";
import { Tag } from "../component/Tag";
import { TagPercentageChart } from "../component/TagPercentageChart";
import { H2 } from "../component/Typography";
import { WeekPicker } from "../component/WeekPicker";
import { WeekTotalChart } from "../component/WeekTotalChart";
import {
  GCalendarListEntry,
  TagPercentage,
  WeekTotal,
  calendarListToCheckboxDataInfo,
  eventsToWeekTotal,
  getCalendarLists,
  getMultipleRangeEvents,
  weekTotalToTagPercentage,
  weekTotalToTags,
} from "../data/calendar";
import { getWeekRange } from "../data/date";
import {
  getCalendarListsPlaceholder,
  getTagPercentagePlaceholder,
  getTagsPlaceholder,
  getWeekTotalPlaceholder,
} from "../data/placeholder";
import { fb } from "../modules/auth";

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.

  const [weekRange, setWeekRange] = useState(getWeekRange());

  const [calendarLists, setCalendarLists] = useState<GCalendarListEntry[]>([]);
  const [selectedCalendarLists, setSelectedCalendarLists] = useState<
    GCalendarListEntry[]
  >([]);

  const [tagsInfo, setTagsInfo] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [weekTotal, setWeekTotal] = useState<WeekTotal[]>([]);
  const [tagPercentage, setTagPercentage] = useState<TagPercentage[]>([]);

  const getUserCalendarList = async (): Promise<GCalendarListEntry[]> => {
    const calList = await getCalendarLists();
    setCalendarLists(calList);
    setSelectedCalendarLists(calList);
    return calList;
  };

  const getCalendarEvents = async (scls: GCalendarListEntry[]) => {
    const events = await getMultipleRangeEvents(
      scls,
      weekRange[0],
      weekRange[1]
    );

    const weekTotal = eventsToWeekTotal(events);
    setWeekTotal(weekTotal);

    const tags = weekTotalToTags(weekTotal);
    setTagsInfo(tags);
    setSelectedTags(tags.map((t) => t.title));

    const tagPercentage = weekTotalToTagPercentage(weekTotal);
    setTagPercentage(tagPercentage);
  };

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

      gapi.client.load("calendar", "v3", async () => {
        const GoogleAuth = gapi.auth2.getAuthInstance();
        const signedIn = GoogleAuth.isSignedIn.get();
        if (signedIn) {
          setIsSignedIn(signedIn);
          const scls = await getUserCalendarList();
          getCalendarEvents(scls);
        } else {
          // set up placeholders
          const calPlaceholder = getCalendarListsPlaceholder();
          setCalendarLists(calPlaceholder);
          setSelectedCalendarLists(calPlaceholder);
          const tagsPlaceholder = getTagsPlaceholder();
          setTagsInfo(tagsPlaceholder);
          setSelectedTags(tagsPlaceholder.map((t) => t.title));

          setWeekTotal(getWeekTotalPlaceholder());
          setTagPercentage(getTagPercentagePlaceholder());
        }
      });
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
    const scls = await getUserCalendarList();
    getCalendarEvents(scls);
  };

  const signOut = async () => {
    const googleAuth = gapi.auth2.getAuthInstance();
    await googleAuth.signOut();
    setIsSignedIn(false);

    setCalendarLists([]);
    setSelectedCalendarLists([]);
    setTagsInfo([]);
    setSelectedTags([]);

    setWeekTotal([]);
    setTagPercentage([]);
  };

  return (
    <Layout>
      <Script src="https://apis.google.com/js/api.js" onLoad={initGapi} />

      <Spacer size="24" />
      <SpreadLayout>
        <H2>Calendars</H2>
        <AuthButton isSignedIn={isSignedIn} signIn={signIn} signOut={signOut} />
      </SpreadLayout>

      <CheckboxGroup
        data={calendarLists.map(calendarListToCheckboxDataInfo)}
        selected={selectedCalendarLists
          .map(calendarListToCheckboxDataInfo)
          .map((cdi) => cdi.id)}
        onChange={(ids) => {
          const newSelectedCalendarLists = ids
            .map((id) => calendarLists.find((cl) => cl.id === id))
            .filter((cl) => cl) as GCalendarListEntry[];
          setSelectedCalendarLists(newSelectedCalendarLists);
        }}
      />

      {isSignedIn && (
        <>
          <Spacer size="24" />
          <H2>Select Week</H2>
          <SpreadLayout>
            <WeekPicker
              week={weekRange[0]}
              onChange={(date) => setWeekRange(getWeekRange(date))}
            />
            <RefreshButton
              onClick={() => getCalendarEvents(selectedCalendarLists)}
            />
          </SpreadLayout>
        </>
      )}

      <Spacer size="24" />
      <H2>Tags</H2>
      <CheckboxGroup
        data={tagsInfo.map(({ title, color }) => ({
          title,
          id: title,
          color,
        }))}
        selected={selectedTags}
        onChange={setSelectedTags}
      />

      <Spacer size="24" />
      <H2>Weekly Hours</H2>
      <WeekTotalChart
        data={weekTotal.filter(
          (wt) =>
            selectedCalendarLists.some((scl) => scl.id === wt.calendar.id) &&
            selectedTags.includes(wt.tag.title)
        )}
      />

      <Spacer size="24" />
      <H2>Weekly Percentage</H2>
      <TagPercentageChart
        data={tagPercentage.filter(
          (wt) =>
            selectedCalendarLists.some((scl) => scl.id === wt.calendar.id) &&
            selectedTags.includes(wt.tag.title)
        )}
      />

      <Spacer size="60" />
    </Layout>
  );
}

const Layout = styled.div`
  max-width: 960px;
  margin: 60px auto;
  padding: 60px;
  box-sizing: border-box;

  @media (max-width: 800px) {
    margin: 12px auto;
    padding: 12px;
  }
`;

const SpreadLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

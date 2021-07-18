import { BarDatum, ResponsiveBar } from "@nivo/bar";

import { WeekTotal } from "../data/calendar";
import { chartTheme } from "./chart";

interface Props {
  data: WeekTotal[];
}

export const WeekTotalChart = (props: Props) => {
  const { data } = props;

  return (
    <div style={{ height: "240px" }}>
      <ResponsiveBar
        data={data as unknown as BarDatum[]}
        indexBy="tag.title"
        colors={data.map((d) => d.tag.color)}
        colorBy="indexValue"
        keys={["recurring", "oneOff"]}
        layout="horizontal"
        margin={{ left: 120 }}
        enableGridY={false}
        labelSkipWidth={1}
        padding={0.1}
        innerPadding={1}
        borderRadius={4}
        axisBottom={{ tickSize: 0, format: () => "" }}
        axisLeft={{
          tickSize: 0,
          format: (v) => {
            console.log("v: ", v);
            return "#" + v;
          },
        }}
        theme={chartTheme}
      />
    </div>
  );
};

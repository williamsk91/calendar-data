import { BarDatum, ResponsiveBar } from "@nivo/bar";

import { WeekTotal } from "../data/calendar";
import { chartTheme } from "./chart";

interface Props {
  data: WeekTotal[];
}

export const WeekTotalChart = (props: Props) => {
  const { data } = props;

  const height = data.length * 56;
  return (
    <div style={{ height: height + "px" }}>
      <ResponsiveBar
        data={data as unknown as BarDatum[]}
        indexBy="tag.title"
        colors={data.map((d) => d.tag.color)}
        colorBy="indexValue"
        keys={["recurring", "oneOff"]}
        layout="horizontal"
        margin={{ left: 120 }}
        enableGridY={false}
        labelSkipWidth={25}
        padding={0.1}
        innerPadding={1}
        borderRadius={3}
        axisBottom={{ tickSize: 0, format: () => "" }}
        axisLeft={{
          tickSize: 0,
          format: (v) => "#" + v,
        }}
        theme={chartTheme}
      />
    </div>
  );
};

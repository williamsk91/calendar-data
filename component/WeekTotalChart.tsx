import { BarDatum, ResponsiveBar } from "@nivo/bar";

import { WeekTotal } from "../data/calendar";

interface Props {
  data: WeekTotal[];
}

export const WeekTotalChart = (props: Props) => {
  const { data } = props;

  return (
    <div style={{ height: "240px", width: "600px" }}>
      <ResponsiveBar
        data={data as unknown as BarDatum[]}
        indexBy="tag"
        keys={["recurring", "oneOff"]}
        layout="horizontal"
        margin={{ top: 40, bottom: 80, left: 80, right: 80 }}
        enableGridY={false}
        labelSkipWidth={1}
      />
    </div>
  );
};

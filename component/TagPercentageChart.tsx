import { BarDatum, ResponsiveBar } from "@nivo/bar";
import { Badge } from "antd";
import styled from "styled-components";

import { TagPercentage } from "../data/calendar";
import { BarTooltip } from "./BarTooltip";
import { chartTheme } from "./chart";

interface Props {
  data: TagPercentage[];
}

export const TagPercentageChart = (props: Props) => {
  const { data } = props;

  const parsedData = tagPercentageToData(data);
  const keys = Object.keys(parsedData);

  return (
    <div>
      <div style={{ height: "62px" }}>
        <ResponsiveBar
          data={[parsedData] as unknown as BarDatum[]}
          keys={keys}
          colors={data.map((d) => d.tag.color)}
          colorBy="id"
          layout="horizontal"
          enableGridY={false}
          labelSkipWidth={25}
          padding={0.1}
          innerPadding={1}
          borderRadius={3}
          axisBottom={{ tickSize: 0, format: () => "" }}
          axisLeft={{ tickSize: 0 }}
          theme={chartTheme}
          tooltip={(data) => <BarTooltip title={data.id} value={data.value} />}
          defs={[
            {
              id: "lines",
              type: "patternLines",
              background: "white",
              color: "lightblue",
              rotation: -40,
              lineWidth: 2,
              spacing: 7,
            },
          ]}
          fill={[
            {
              match: {
                id: "unscheduled",
              },
              id: "lines",
            },
          ]}
        />
      </div>
      <BadgeContainer>
        {data.map((d) => (
          <StyledBadge
            key={d.tag.title}
            text={"#" + d.tag.title}
            color={d.tag.color}
          />
        ))}
      </BadgeContainer>
    </div>
  );
};

type Data = Record<string, string>;

const tagPercentageToData = (tagPercentage: TagPercentage[]): Data => {
  const data: Data = {};

  const weeklyHourSum = 7 * 24;

  tagPercentage.forEach((tp) => {
    data[tp.tag.title] = ((tp.total / weeklyHourSum) * 100).toFixed(0);
  });

  const scheduledSum = tagPercentage.reduce((sum, t) => (sum += t.total), 0);
  data.unscheduled = (
    ((weeklyHourSum - scheduledSum) / weeklyHourSum) *
    100
  ).toFixed(0);

  return data;
};

const BadgeContainer = styled.div`
  padding: 0 120px;
  display: flex;
  flex-wrap: wrap;

  @media (max-width: 800px) {
    padding: 0 24px;
  }
`;

const StyledBadge = styled(Badge)`
  width: 50%;

  .ant-badge-status-text {
    font-size: 22px;
    color: rgba(0, 0, 0, 0.6);
  }

  .ant-badge-status-dot {
    top: -4px;
    width: 16px;
    height: 16px;
  }
`;

import { BarDatum, ResponsiveBar } from "@nivo/bar";
import { Badge } from "antd";
import styled from "styled-components";

import { TagPercentage } from "../data/calendar";
import { chartTheme } from "./chart";

interface Props {
  data: TagPercentage[];
}

export const TagPercentageChart = (props: Props) => {
  const { data } = props;
  console.log("data: ", data);

  const parsedData = tagPercentageToData(data);
  console.log("parsedData: ", parsedData);
  const keys = Object.keys(parsedData);
  console.log("keys: ", keys);

  return (
    <div style={{ height: "60px" }}>
      <ResponsiveBar
        data={[parsedData] as unknown as BarDatum[]}
        label={(d) => `${d.value}%`}
        keys={keys}
        colors={data.map((d) => d.tag.color)}
        colorBy="id"
        layout="horizontal"
        enableGridY={false}
        labelSkipWidth={1}
        padding={0.1}
        innerPadding={1}
        borderRadius={4}
        axisBottom={{ tickSize: 0, format: () => "" }}
        axisLeft={{ tickSize: 0 }}
        theme={chartTheme}
      />
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

  const sum = tagPercentage.reduce((sum, tp) => sum + tp.total, 0);

  tagPercentage.forEach((tp) => {
    data[tp.tag.title] = ((tp.total / sum) * 100).toFixed(0);
  });

  return data;
};

const BadgeContainer = styled.div`
  padding: 0 120px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledBadge = styled(Badge)`
  width: 50%;

  .ant-badge-status-text {
    font-size: 24px;
  }

  .ant-badge-status-dot {
    top: -4px;
    width: 16px;
    height: 16px;
  }
`;

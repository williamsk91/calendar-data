import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import Image from "next/image";

import tagExampleSrc from "../assets/tag-example.png";

interface Props {
  hasTags: boolean;
}
export const TagExplanation = (props: Props) => {
  return (
    <Tooltip
      placement="topLeft"
      title={() => {
        return (
          <div>
            Set tag by adding
            <b> #tagname </b>
            to the beginning of an event&apos;s description
            <Image src={tagExampleSrc} alt="example of setting a tag" />
          </div>
        );
      }}
    >
      <Button
        shape="circle"
        type={props.hasTags ? "text" : "primary"}
        icon={<QuestionCircleOutlined />}
      />
    </Tooltip>
  );
};

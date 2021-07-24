import { Tag as ATag } from "antd";

export interface Tag {
  title: string;
  color: string;
}

interface Props {
  tag: Tag;
}

export const TagTitle = (props: Props) => {
  const { tag } = props;
  return <ATag color={tag.color}>{tag.title}</ATag>;
};

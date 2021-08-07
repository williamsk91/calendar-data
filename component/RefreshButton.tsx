import { SyncOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface Props {
  onClick: () => void;
}

export const RefreshButton = (props: Props) => (
  <Button onClick={props.onClick} shape="round" icon={<SyncOutlined />}>
    refresh
  </Button>
);

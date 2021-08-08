import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface Props {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const AuthButton = (props: Props) => {
  const { isSignedIn, signIn, signOut } = props;
  return (
    <div>
      {isSignedIn ? (
        <Button icon={<LogoutOutlined />} shape="round" onClick={signOut}>
          sign out
        </Button>
      ) : (
        <Button
          icon={<LoginOutlined />}
          type="primary"
          shape="round"
          onClick={signIn}
        >
          sign in
        </Button>
      )}
    </div>
  );
};

import { useState, useEffect } from "react";
import { Avatar, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useStore } from "@/app/store/store";
import { User } from "@/app/types";
import { Conversations } from "@ant-design/x";

interface NavigationProps {
  onClose: () => void;
}

export default function Navigation({ onClose }: NavigationProps) {
  const [userId, setUserId] = useState("1");
  const setUser = useStore((state) => state.setUser);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    const u = userList.find((e: User) => `${e.id}` === userId);
    if (u) {
      setUser(u);
      onClose(); // 选择用户时关闭导航
    }
  }, [userId]);

  const getUserInfo = async () => {
    fetch("/api/get_info")
      .then((res) => res.json())
      .then((data) => {
        const arr = data.characters.map((e: any) => {
          e.key = `${e.id}`;
          e.label = e.name;
          e.icon = <Avatar src={e.avatar} />;
          e.message = [];
          return e;
        });
        setUserList(arr);
        setUser(arr[0]);
      });
  };

  const { token } = theme.useToken();
  const style = {
    width: 242,
    background: token.colorBgContainer,
    borderRadius: token.borderRadius,
  };

  return (
    <div className="h-full">
      <div className="lg:hidden flex justify-end p-2">
        <CloseOutlined className="cursor-pointer " onClick={onClose} />
      </div>
      <Conversations
        onActiveChange={(e) => setUserId(e)}
        accessKey={userId}
        items={userList}
        defaultActiveKey="1"
        style={style}
      />
    </div>
  );
}

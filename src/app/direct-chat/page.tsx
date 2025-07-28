"use client";
import { App } from "antd";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/app/store/store";
import MainContent from "@/components/MainContent";
import { User } from "@/app/types";

// 静态页面组件 - 现在用于 id=7
function StaticPageComponent() {
  return (
    <div className="w-screen h-screen">
      <iframe
        src="/index/index.html"
        className="w-full h-full border-0"
        title="静态页面"
      />
    </div>
  );
}

// 创建一个客户端组件来处理参数获取
function DirectChatContent() {
  const searchParams = useSearchParams();
  const characterId = searchParams.get("id");
  const setUser = useStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // 如果 id=7，显示静态页面
  if (characterId === "7") {
    return <StaticPageComponent />;
  }

  // 特殊处理：id=2 实际使用 id=7 的角色数据
  const actualCharacterId = characterId === "2" ? "7" : characterId;

  // id=1 和其他 id 都使用正常的 AI 对话功能

  useEffect(() => {
    // 获取角色信息
    if (characterId) {
      fetch("/api/get_info")
        .then((res) => res.json())
        .then((data) => {
          if (!data.characters || data.characters.length === 0) {
            setError("获取角色列表失败");
            setLoading(false);
            return;
          }

          const character = data.characters.find((c: any) => `${c.id}` === actualCharacterId);
          if (character) {
            // 设置用户信息，添加必要的字段
            const user: User = {
              id: character.id,
              name: character.name,
              greeting: character.greeting || "你好，我是" + character.name,
              avatar: character.avatar,
              background: character.background,
              message: []
            };
            setUser(user);
            setLoading(false);
          } else {
            setError("找不到指定的角色");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("获取角色信息失败:", err);
          setError("获取角色信息失败");
          setLoading(false);
        });
    } else {
      setError("请在URL中指定角色ID");
      setLoading(false);
    }
  }, [characterId, actualCharacterId, setUser]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/direct-chat/info')}
        >
          查看可用角色
        </button>
      </div>
    );
  }

  return <MainContent directMode={true} />;
}

// 主页面组件使用Suspense包装参数获取组件
export default function DirectChat() {
  return (
    <App>
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">加载中...</div>}>
        <DirectChatContent />
      </Suspense>
    </App>
  );
}
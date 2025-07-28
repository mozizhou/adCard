"use client";
import { useEffect, useState } from "react";
import { Card, List, Button } from "antd";
import { User } from "@/app/types";
import Link from "next/link";
import Image from "next/image";

export default function DirectChatInfo() {
  const [characters, setCharacters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // 设置origin，避免服务器端渲染时访问window
    setOrigin(window.location.origin);
    
    // 获取所有角色信息
    fetch("/api/get_info")
      .then((res) => res.json())
      .then((data) => {
        setCharacters(data.characters);
        setLoading(false);
      })
      .catch((err) => {
        console.error("获取角色信息失败:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">直接聊天功能使用说明</h1>
      
      <Card className="mb-6">
        <p className="mb-4">您可以通过以下URL格式直接与指定角色聊天，无需登录：</p>
        <code className="block bg-gray-100 p-2 rounded">
          {origin ? `${origin}/direct-chat?id=角色ID` : '/direct-chat?id=角色ID'}
        </code>
        <p className="mt-4">例如：</p>
        <code className="block bg-gray-100 p-2 rounded">
          {origin ? `${origin}/direct-chat?id=1` : '/direct-chat?id=1'}
        </code>
      </Card>
      
      <h2 className="text-xl font-bold mb-4">可用角色列表：</h2>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={characters}
          renderItem={(item) => (
            <List.Item>
              <Card 
                title={`${item.name} (ID: ${item.id})`}
                cover={
                  <div className="h-48 relative">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                }
                actions={[
                  <Link href={`/direct-chat?id=${item.id}`} key="chat">
                    <Button type="primary">开始聊天</Button>
                  </Link>
                ]}
              >
                <Card.Meta
                  title={item.name}
                  description={item.greeting.substring(0, 100) + '...'}
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
} 
"use client";
import Link from "next/link";
import { Button } from "antd";
import { useRouter } from "next/navigation";

// 链接导航页面
export default function Links() {
  const router = useRouter();
  
  // 链接列表
  const links = [
    {
      title: "AI 对话 (ID=1)",
      description: "与 AI 角色进行对话",
      url: "/direct-chat?id=1",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "AI 对话 (ID=2)",
      description: "与 ID=7 的角色对话",
      url: "/direct-chat?id=2",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "静态页面 (ID=7)",
      description: "显示静态页面内容",
      url: "/direct-chat?id=7",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "酒店房卡",
      description: "查看酒店房卡页面",
      url: "/hotel-card",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "拳击页面",
      description: "查看拳击训练页面",
      url: "/boxing",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "角色信息",
      description: "查看所有可用角色",
      url: "/direct-chat/info",
      color: "bg-yellow-500 hover:bg-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">页面导航</h1>
          <p className="text-xl text-gray-600">选择要访问的页面</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.map((link, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className={`h-3 ${link.color.split(' ')[0]}`}></div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{link.title}</h2>
                <p className="text-gray-600 mb-4">{link.description}</p>
                <div className="flex justify-between items-center">
                  <Link href={link.url}>
                    <Button type="primary" className={link.color}>
                      访问页面
                    </Button>
                  </Link>
                  <span className="text-sm text-gray-500">ID: {index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            type="default" 
            onClick={() => router.push('/')}
            className="mx-2"
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}

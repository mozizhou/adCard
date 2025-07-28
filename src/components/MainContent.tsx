"use client";
import { Bubble, Sender } from "@ant-design/x";
import {
  UserOutlined,
  SoundOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Flex, App, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import type { GetProp, GetRef } from "antd";
import { useStore } from "@/app/store/store";
import { Message } from "@/app/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMobileAudio } from '@/hooks/useMobileAudio';

const { Title } = Typography;

interface MainContentProps {
  directMode?: boolean;
}

export default function MainContent({ directMode = false }: MainContentProps) {
  const [value, setValue] = useState<string>("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const mainRef = useRef<GetRef<typeof Bubble.List>>(null);
  const user = useStore((state) => state.user);
  const messageData = useStore((state) => state.messageData);
  const setMessageData = useStore((state) => state.setMessageData);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [contentHeight, setContentHeight] = useState("calc(100vh - 120px)");

  let rolesAsObject: GetProp<typeof Bubble.List, "roles"> = {
    ai: {
      placement: "start",
      avatar: { icon: <UserOutlined /> },
      typing: { step: 5, interval: 20 },
      style: {
        maxWidth: 500,
      },
    },
    user: {
      placement: "end",
      avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
    },
  };
  
  useEffect(() => {
    let token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    } else if (!directMode) {
      router.push("/login");
    } else {
      // 直接聊天模式，使用临时token
      setToken("direct_chat_user");
    }
  }, [directMode, router]);
  
  useEffect(() => {
    if (user) {
      setLoading(false);
      const msg = messageData.find((e) => e.name === user.name);
      console.log(user);
      let msgList: Message[] = [];
      if (!msg || msg.message.length === 0) {
        msgList = [
          {
            id: user.id,
            content: user.greeting,
            type: "start",
            role: "assistant",
          },
        ];
      } else {
        msgList = msg?.message || [];
      }
      setMessageList(msgList);
      handleSetMessageData(msgList);
    }
  }, [user, messageData]);
  
  // 计算内容区域高度
  useEffect(() => {
    // 如果是直接聊天模式，需要为标题栏留出空间
    if (directMode) {
      setContentHeight("calc(100vh - 160px)");
    } else {
      setContentHeight("calc(100vh - 120px)");
    }
  }, [directMode]);

  const handleSetMessageData = (message: Message[]) => {
    if (!user) return;
    const index = messageData.findIndex((e) => e.name === user?.name);
    if (index === -1) {
      messageData.push({
        name: user.name,
        message,
      });
    } else {
      messageData[index] = {
        name: user.name,
        message,
      };
    }
    setMessageData(messageData);
  };
  const { playAudio, stopAudio, isPlaying, error } = useMobileAudio({
    retryAttempts: 3,
    retryDelay: 800,
    onPlayStart: () => {
      console.log('音频开始播放');
    },
    onPlayEnd: () => {
      console.log('音频播放结束');
      // 音频播放完成后停止动画
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === currentPlayingId ? { ...data, voiceType: 0 } : data
        );
        return ary;
      });
      setCurrentPlayingId(null);
    },
    onPlayError: (err) => {
      console.error('音频播放失败:', err);
      // 更新UI状态
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === currentPlayingId ? { ...data, voiceType: 0 } : data
        );
        return ary;
      });
      setCurrentPlayingId(null);
    }
  });

  const togglePlay = (e: Message) => {
    // 如果当前正在播放，则停止播放
    if (currentPlayingId === e.id) {
      stopAudio();
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === e.id ? { ...data, voiceType: 0 } : data
        );
        return ary;
      });
      setCurrentPlayingId(null);
      return;
    }

    // 停止之前播放的音频
    if (currentPlayingId !== null) {
      stopAudio();
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === currentPlayingId ? { ...data, voiceType: 0 } : data
        );
        return ary;
      });
    }

    setCurrentPlayingId(e.id);
    setMessageList((list) => {
      let ary = list.map((data) =>
        data.id === e.id ? { ...data, voiceType: 1 } : data
      );
      return ary;
    });

    // 设置超时保护，防止动画一直显示
    const timeoutId = setTimeout(() => {
      console.warn('音频播放超时，强制停止动画');
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === e.id ? { ...data, voiceType: 0 } : data
        );
        return ary;
      });
      setCurrentPlayingId(null);
    }, 30000); // 30秒超时

    // 关键：在用户点击事件中立即开始音频请求和播放流程
    // 不使用 async/await，避免打断用户交互链
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: token,
        text: e.content,
        id: user?.id,
        direct_mode: directMode,
      }),
    }).then(res => {
      // 检查请求是否成功
      if (!res.ok) {
        clearTimeout(timeoutId);
        throw new Error(`TTS请求失败: ${res.status} ${res.statusText}`);
      }

      // 更新为播放动画状态
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === e.id ? { ...data, voiceType: 2 } : data
        );
        return ary;
      });

      return res.blob();
    }).then(audioBlob => {
      // 检查音频数据是否有效
      if (audioBlob.size === 0) {
        clearTimeout(timeoutId);
        throw new Error('接收到空的音频数据');
      }

      // 显示音频大小信息
      const audioSizeKB = (audioBlob.size / 1024).toFixed(2);
      const audioSizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
      const sizeText = audioBlob.size > 1024 * 1024
        ? `${audioSizeMB} MB`
        : `${audioSizeKB} KB`;

      message.info(`音频接收完成，大小: ${sizeText}`, 2);

      const audioUrl = URL.createObjectURL(audioBlob);

      // 关键：在同一个用户交互链中直接播放音频
      return playAudio(audioUrl).then(success => {
        clearTimeout(timeoutId);

        // 清理URL对象
        setTimeout(() => {
          URL.revokeObjectURL(audioUrl);
        }, 1000);

        if (!success) {
          throw new Error('音频播放失败');
        }
      });
    }).catch(error => {
      console.error('TTS请求失败:', error);
      clearTimeout(timeoutId);
      // 请求失败时立即停止动画
      setMessageList((list) => {
        let ary = list.map((data) =>
          data.id === e.id ? { ...data, voiceType: 0 } : data
        );
        return ary;
      });
      setCurrentPlayingId(null);
    });
  };

  const [loading, setLoading] = useState<boolean>(false);
  const { message } = App.useApp();
  const handleSendMessage = async () => {
    setLoading(true);
    let id = 0;
    if (messageList.length === 0) {
      id = 1;
    } else {
      id = messageList[messageList.length - 1].id + 1;
    }
    setMessageList([
      ...messageList,
      { id, type: "end", content: value, role: "user" },
    ]);
    setValue("");
    mainRef.current?.scrollTo({ key: 0, block: "nearest" });
  };

  useEffect(() => {
    if (loading && user) {
      let ary: { role: string; content: string }[] = [];
      messageList.map((e) => {
        ary.push({ role: e.role, content: e.content });
      });
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: token,
          messages: ary,
          id: user.id,
          direct_mode: directMode,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setLoading(false);
          let id = 0;
          if (messageList.length === 0) {
            id = 1;
          } else {
            id = messageList[messageList.length - 1].id + 1;
          }
          const arr: Message[] = [
            ...messageList,
            { id, type: "start", content: data.content, role: data.role },
          ];
          setMessageList(arr);
          handleSetMessageData(arr);
          mainRef.current?.scrollTo({ key: 0, block: "nearest" });
        });
    }
  }, [loading]);

  const iconStyle = {
    // border: "1px solid #ccc",
    // borderRadius: "4px",
    // padding: "2px",
    // boxShadow: "0 0 4px #fff",
    // backgroundColor: "#fff",
  };

  return (
    <div className="w-screen h-screen flex flex-col relative">
      {/* 整个背景图层 */}
      <div className="absolute inset-0 z-[-2]">
        <Image
          src={
            user?.background ||
            "http://47.99.131.58:8000/photo?idx=1&image_type=background"
          }
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      
      {/* 半透明遮罩层 */}
      <div className="absolute inset-0 bg-black/5 z-[-1]"></div>
      
      {/* 直接聊天模式下的标题栏 */}
      {directMode && user && (
        <div className="w-full p-3 flex items-center justify-center z-10">
          <div className="px-6 py-2 bg-white/30 backdrop-blur-md rounded-full shadow-lg">
            <Title 
              level={3} 
              style={{ 
                margin: 0, 
                textAlign: 'center',
                textShadow: '0px 1px 2px rgba(0,0,0,0.3), 0px 0px 4px rgba(255,255,255,0.7)',
                fontWeight: 'bold',
                color: '#1a1a1a'
              }}
            >
              {user.name}
            </Title>
          </div>
        </div>
      )}
      
      <div 
        className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden"
        style={{ height: contentHeight }}
      >
        <div className="flex-1 overflow-y-auto mb-2">
          {user ? (
            <Bubble.List
              ref={mainRef}
              roles={rolesAsObject}
              autoScroll
              items={messageList.map((e, index) => {
                return {
                  key: e.id,
                  role: e.type == "start" ? "ai" : "user",
                  content: e.content,
                  avatar:
                    e.type == "start" ? (
                      <div className="w-8 h-8">
                        {user ? (
                          <Image
                            className="rounded-2xl"
                            width={56}
                            height={56}
                            priority
                            alt=""
                            src={user.avatar}
                          ></Image>
                        ) : (
                          <UserOutlined />
                        )}{" "}
                      </div>
                    ) : (
                      <UserOutlined />
                    ),
                  footer: e.type == "start" && (
                    <div
                      onClick={() => togglePlay(e)}
                      className="cursor-pointer"
                    >
                      {e.voiceType == 1 ? (
                        <LoadingOutlined
                          style={{ borderRadius: "50%" }}
                        />
                      ) : e.voiceType == 2 ? (
                        <Image
                          alt=""
                          src="/playing.gif"
                          width={24}
                          height={24}
                        ></Image>
                      ) : (
                        <Image
                          src="/stop.png"
                          alt=""
                          width={24}
                          height={24}
                        ></Image>
                      )}
                    </div>
                  ),
                };
              })}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg">请选择角色</p>
            </div>
          )}
        </div>

        <div className="mt-1">
          <Flex vertical gap="middle">
            <Sender
              loading={loading}
              value={value}
              onChange={(v) => {
                setValue(v);
              }}
              onSubmit={handleSendMessage}
              onCancel={() => {
                setLoading(false);
                message.error("取消发送!");
              }}
            />
          </Flex>
        </div>
      </div>
    </div>
  );
}



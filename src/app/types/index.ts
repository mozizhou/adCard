

export interface Message {
  id: number,
  type: "start" | "end" | undefined,
  role: string,
  content: string,
  voiceType?: number,
}
export interface MessageData {
  name: string,
  message: Message[]
}
export interface User {
  id: number,
  greeting: string,
  name: string,
  avatar: string,
  background: string,
  message: Message[]
}

export interface GlobalData {
  user: User | null,
  messageData: MessageData[],
  setUser: (user: User) => void,
  setMessageData: (messageData: MessageData[]) => void
}


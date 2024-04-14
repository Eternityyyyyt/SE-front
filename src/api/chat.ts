
import { Conversation, Message } from './types';
import axios from 'axios';


export type AddMessageArgs = {
    userName: string;
    chat_id: number;
    content: string;
    replying: number;       // 没有引用replying设置为0
};
// 向服务器添加一条消息
export async function addMessage({
    userName,
    chat_id,
    content,
    replying,               // 回应哪条消息的message id
  }: AddMessageArgs, token:string) {
    const { data } = await axios.post(`/api/chat/message`, {
      userName: userName,   // 发送者的用户名
      chat_id: chat_id,     // 会话ID
      content: content,     // 消息内容
      replying: replying,
    },{
      headers: {
          Authorization: `${token}`
      }
  });
    return data;            // message_id (data.data.message_id)
}

export type AddConversationArgs = {
    // type: 'private_chat' | 'group_chat';
    // members: string[];
    createrName: string;
    memberName: string;
}
// 向服务器添加一个新会话 Private Chat
export async function addConversation({ createrName, memberName }: AddConversationArgs, token:string) {
    const { data } = await axios.post("/api/chat/createPrivate", {
      createrName,
      memberName,
    },{
      headers: {
          Authorization: `${token}`
      }
  });
    return data.data as Conversation; // 返回一个Conversation类型
}

export type GetMessagesArgs = {
    userName: string;
    chat_id: number;
    after?: number; // 可能没有消息，某一时间戳，一般为最后一条消息的时间戳
    limit?: number; // 可以不设置，默认为100
};
// 获取消息列表
export async function getMessages({
    userName,
    chat_id,
    after,
    limit,
  }: GetMessagesArgs, token:string) {
    const messages: Message[] = [];
      const { data } = await axios.get("/api/chat/message", {
        headers: {
          Authorization: `${token}`
        },
        params: {
          userName: userName,   // 查询消息的用户名
          chat_id: chat_id,     // 查询消息的会话 ID
          after: after,         // 表示从此时间戳之后的消息
          limit: limit,         // 每次请求的消息数量限制
        },
      });
      data.data.forEach((item: Message) => messages.push(item)); // 将获取到的消息添加到列表中
      after = messages[messages.length - 1].create_time; // 更新游标为最后一条消息的时间戳，用于下轮查询
    // 得到chat_id的after后的所有消息，返回一个Message List
    return messages;
}
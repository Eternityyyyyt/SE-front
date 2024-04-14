import { useEffect } from 'react';
import { Conversation, Message } from './types';
import axios from 'axios';

export type AddMessageArgs = {
    userName: string;
    chat_id: number;
    content: string;
    replying: number; // 没有引用replying设置为0
};
// 向服务器添加一条消息
export async function addMessage({
    userName,
    chat_id,
    content,
    replying,
  }: AddMessageArgs) {
    const { data } = await axios.post(`/api/chat/message`, {
      userName: userName, // 发送者的用户名
      chat_id: chat_id, // 会话ID
      content: content, // 消息内容
      replying: replying,
    });
    return data;
}

export type AddConversationArgs = {
    // type: 'private_chat' | 'group_chat';
    // members: string[];
    createrName: string;
    memberName: string;
}
// 向服务器添加一个新会话 (私聊/群聊)
export async function addConversation({ createrName, memberName }: AddConversationArgs) {
    const { data } = await axios.post("/api/chat/createPrivate", {
      createrName,
      memberName,
    });
    return data.data as Conversation;
}

export type GetMessagesArgs = {
    userName: string;
    chat_id: number;
    after: number;
    limit: number;
};
// 获取消息列表
export async function getMessages({
    userName,
    chat_id,
    after,
    limit,
  }: GetMessagesArgs) {
    const messages: Message[] = [];
    // while (true) {
      // 使用循环来处理分页，直到没有下一页
      const { data } = await axios.get("/api/chat/message", {
        params: {
          userName: userName, // 查询消息的用户名
          chat_id: chat_id, // 查询消息的会话 ID
          after: after, // 用于分页的游标，表示从此时间戳之后的消息
          limit: limit, // 每次请求的消息数量限制
        },
      });
      data.data.forEach((item: Message) => messages.push(item)); // 将获取到的消息添加到列表中
      // 先不考虑分页
      // if (!data.has_next) break; // 如果没有下一页，则停止循环
      after = messages[messages.length - 1].create_time; // 更新游标为最后一条消息的时间戳，用于下轮查询
    // }
    return messages;
}

// 暂时不使用websocket
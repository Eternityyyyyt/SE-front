export type Message = {
    chat_id: number; // 会话 ID
    message_id: number; // 消息ID
    content: string; // 消息内容
    senderNickname: string; // 发送者
    create_time: number; // 时间戳
    replying: number;
    repliedCount: number;
};

  
export type Conversation = {
    chat_id: number; // 会话ID
    alreadyCreated: boolean;
    // type: 'group_chat' | 'private_chat'; // 会话类型：群聊或私聊
    // members: string[]; // 会话成员列表
    // unreadCount?: number; // 未读计数
};
  
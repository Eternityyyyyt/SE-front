export type Message = {
    message_id: number;     // 消息ID 自增无重复
    chat_id: number;        // 会话 ID 所属会话id
    content: string;        // 消息内容
    senderNickname: string; // 发送者
    create_time: number;    // 时间戳
    replying: number;       // 回复那条message（id）相当于微信的引用
    repliedCount: number;   // 此条消息被回复的次数，默认为0
};

  
export type Conversation = {
    chat_id: number;            // 会话ID
    // type: 'group_chat' | 'private_chat';
    members: string[];
    isGroup:boolean;
    // unreadCount?: number;
};
  
export type ActiveConversation = {
    // 以userName作为主键，存储目前活跃/存在的conversation的id
    // 感觉不一定需要
    userName: string;
    chatIds: number[];
};
import Dexie from 'dexie';
import { Conversation, Message} from './types';
import { getMessages } from './chat';           // 获取消息列表，返回一个Message类型的List；参数提供？

export class CachedData extends Dexie {
  messages: Dexie.Table<Message, number>;
  conversations: Dexie.Table<Conversation, number>;

  constructor() {
    super('CachedData');
    this.version(1).stores({
      messages: '&message_id, senderNickname, chat_id, create_time, replying, repliedCount', // messsage_id作为主键
      conversations: '&chat_id, alreadyCreated',                                             // chat_id作为主键
    });
    this.messages = this.table('messages');
    this.conversations = this.table('conversations');
  }

  async clearCachedData() {
    await this.messages.clear();
    await this.conversations.clear();
  }

  // 拉取最新消息并更新本地缓存
  // 在HomePage中为每一个active chat调用这个函数
  async pullMessages(userName: string, chat_id: number, after: number, limit: number) {
    // const latestMessage = await this.messages.orderBy('create_time').last();
    const newMessages = await getMessages({ userName, chat_id, after, limit });     // 返回一个 Message List
    await this.messages.bulkPut(newMessages);   // 批量添加到message表单的数据库中
    await this.updateUnreadCounts(newMessages); // 未读消息计数
  }

  async updateUnreadCounts(messages: Message[]) {
    // Implement this function to update unread counts for conversations
  }

  // 返回chat_id下已经存储在前端的Message List
  // 在HomePage中调用然后排序得道最近一条消息作为时间戳
  async getCachedMessages(conversation: Conversation) {
    return this.messages
      .where('chat_id')
      .equals(conversation.chat_id)
      .toArray();
  }
}

export const db = new CachedData();

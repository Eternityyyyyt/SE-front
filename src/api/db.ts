import Dexie, { UpdateSpec } from 'dexie';
import { Conversation, Message } from './types';
import { getConversations,getMessages } from './chat';           // 获取消息列表，返回一个Message类型的List；参数提供？

export class CachedData extends Dexie {
  messages: Dexie.Table<Message, number>;// message_id作为主键
  conversations: Dexie.Table<Conversation, number>; //chat_id作为主键
  activeConversationId: number | null;

  constructor() {
    super('CachedData');
    this.version(1).stores({
      messages: '&message_id, chat_id, content, created_time, sender,replying, repliedCount', // messsage_id作为主键
      conversations: '&chat_id, memberList, isGroup, owner, chatName',                       // chat_id作为主键
    });
    this.messages = this.table('messages');
    this.conversations = this.table('conversations');
    this.activeConversationId = null;
  }

  async clearCachedData() {
    await this.messages.clear();
    await this.conversations.clear();
  }

  // 拉取最新消息并更新本地缓存
  async pullMessages(me: string , token:string) {
    const latestMessage = await this.messages.orderBy('created_time').last(); // 获取本地缓存中最新的一条消息
    const cursor = latestMessage?.created_time; // 以最新消息的时间戳作为游标

    const newMessages = await getMessages({ userName:me, after:cursor },token); // 从服务器获取更新的消息列表
    const convIds = newMessages.map((item) => item.chat_id);
    await this.messages.bulkPut(newMessages); // 使用bulkPut方法批量更新本地缓存
    newMessages.forEach((msg) =>{
      if (msg.replying){
        this.messages.where('message_id').equals(msg.replying).modify((message) =>{
          message.repliedCount++;
        });
      }
      this.messages.put(msg)
      }
    )
    const newConvIds = Array.from(new Set(convIds)); // 获取新出现的会话 ID
    const cachedConvIds = new Set(
      (await this.conversations.where('chat_id').anyOf(newConvIds).toArray()).map(
        (item) => item.chat_id
      )
    ); // 查询本地已经存在的会话信息
    const missingConvIds = newConvIds.filter((chat_id) => !cachedConvIds.has(chat_id));
    await this.pullConversations(me,missingConvIds,token);

    await this.updateUnreadCounts(newMessages);
  }

  // 从服务器拉取指定会话信息并更新本地缓存
  async pullConversations(me:string , convIds: number[],token:string) {
    if (convIds.length) {
      const newConversations = await getConversations({userName:me, idList: convIds },token); // 从服务器批量获取会话信息
      await this.conversations.bulkPut(newConversations); // 使用bulkPut方法批量更新本地缓存
    }
  }
  async updateConversation(me:string , convId: number,token:string) {
    if (convId) {
      const newConversations = await getConversations({userName:me, idList: [convId] },token); // 从服务器批量获取会话信息
      await this.conversations.update(convId,newConversations[0]); // 使用bulkPut方法批量更新本地缓存
      return newConversations[0];
    }
  }
  // 根据新消息批量更新会话的未读计数
  async updateUnreadCounts(messages: Message[]) {
    const conversationIds = messages.map((message) => message.chat_id);
    const uniqueConvIds = Array.from(new Set(conversationIds));

    // 批量获取会话
    const conversations = await this.conversations.bulkGet(uniqueConvIds);
    const updates: {key: number; changes: UpdateSpec<Conversation>}[] = [];

    conversations.forEach((conversation) => {
      if(conversation){
        const unreadCount = conversation.unreadCount || 0;
        const newUnreadCount = unreadCount + messages.filter((message) => message.chat_id === conversation.chat_id).length;
        if(conversation.chat_id !== this.activeConversationId){
          updates.push({
            key: conversation.chat_id,
            changes: { unreadCount: newUnreadCount },
          });
        }
      }
      
    });
    await this.conversations.bulkUpdate(updates);
  }

  // 清除会话的未读计数
  async clearUnreadCount(conversation: Conversation) {
    await this.conversations.update(conversation.chat_id, { unreadCount: 0 });
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

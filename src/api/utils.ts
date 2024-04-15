import { Conversation } from './types';


// 获取会话显示名称的函数
// 目前只涉及私聊界面
export function getConversationDisplayName(conversation: Conversation) {
    // return conversation.type === 'private_chat'
    //   ? `私聊 #${conversation.id}` // 私聊显示`私聊#ID`
    //   : `群聊 #${conversation.id} (${conversation.members.length})`; // 群聊显示`群聊#ID (成员数)`
    return `私聊 #${conversation.chat_id}`;
  }

export function getConversationDisplayMembers(conversation: Conversation , me:string) {//获取显示的聊天成员
  if(!conversation.isGroup){
    return conversation.members.filter(member => member!=me)[0];
  }
  return conversation.members.join(',');
}
import { Conversation } from './types';
import { db } from '../api/db';

// 获取会话显示名称的函数
// 目前只涉及私聊界面
export function getConversationDisplayName(conversation: Conversation ,me:string) {
    // return conversation.type === 'private_chat'
    //   ? `私聊 #${conversation.id}` // 私聊显示`私聊#ID`
    //   : `群聊 #${conversation.id} (${conversation.memberList.length})`; // 群聊显示`群聊#ID (成员数)`
    if(!conversation.isGroup){
      return `${conversation.memberList.filter((user) => user !== me)[0]}`;
    }
    else{
       return conversation.memberList.join(', ')
    }
  }

export function getConversationDisplaymemberList(conversation: Conversation , me:string) {//获取显示的聊天成员
  if(!conversation.isGroup){
    return conversation.memberList.filter(member => member!=me)[0];
  }
  return conversation.memberList.join(',');
}

export async function getPrivateConversationDisplayAvatar(conversation: Conversation , me:string) {//获取聊天应当显示的头像
  let result = "default"
  if(!conversation.isGroup){
    const friendName = conversation.memberList.filter((user) => user !== me)[0];
    try {
      const response = await fetch(`/api/friendList/${me}/${friendName}`, {
        method: 'GET',
      });
      const res = await response.json();
      if (Number(res.code) === 0) {
        result = res.userData.avatar;
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  }
  return result;
}
export async function getUserAvatar(targetUserName:string , me:string) {//获取聊天应当显示的头像
  let result = ""
  //if(me === targetUserName){return "/avatar/01.png"}
  try {
    const response = await fetch(`/api/searchUser/${targetUserName}`, {
      method: 'GET',
    });
    const res = await response.json();
    if (Number(res.code) === 0) {
      result = res.userData.avatar;
    }
  } catch (error) {
    console.error("Error fetching avatar:", error);
  }
  
  return result;
}
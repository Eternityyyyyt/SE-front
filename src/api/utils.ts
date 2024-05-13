import { Conversation } from './types';
import { db } from '../api/db';
import { API_BASE_URL } from './constants';
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

export function getUrl(apiName: string) {
  //console.log(`/${apiName.replace('/api','')}`)
  return `${API_BASE_URL.replace(/\/+$/, '')}/${apiName.replace('/api/','')}`; // 去除基础URL末尾的斜线，防止形成双斜线
}

export async function getPrivateConversationDisplayAvatar(conversation: Conversation , me:string) {//获取聊天应当显示的头像
  let result = "default"
  if(!conversation.isGroup){
    const friendName = conversation.memberList.filter((user) => user !== me)[0];
    try {
      const response = await fetch(getUrl(`/api/searchUser/${friendName}`), {
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
    const response = await fetch(getUrl(`/api/searchUser/${targetUserName}`), {
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
export function formattime(timestamp:number) {
  const now = new Date();
  const seconds = Math.floor(timestamp);
  // 格式化时间戳为易读的时间格式
  if(timestamp == 0){return ''}
  const date = new Date(seconds*1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(today.getDate() - 2);
  
  if (date.toDateString() === today.toDateString()) {
    // 如果是今天，显示时间
    const formattedTime = new Date(seconds * 1000).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formattedTime}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "昨天";
  } else if (date.toDateString() === dayBeforeYesterday.toDateString()) {
    return "前天";
  } else {
    // 否则显示具体日期（只需要月份和年份）
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}
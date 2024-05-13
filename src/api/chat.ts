import { headers } from 'next/headers';
import { Conversation, Message } from './types';
import { getUrl } from './utils';
import axios from 'axios';
import { useEffect } from 'react';
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
    const { data } = await axios.post(getUrl(`/api/chat/message`), {
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

export type GetMessagesArgs = {
    userName?: string;
    chat_id?: number;
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
    let info:string = '';
    try{
      const { data } = await axios.get(getUrl("/api/chat/message"), {
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
      info = data.info
      data.data.map((item:any) => {
          return {
            message_id: item.message_id,
            chat_id: item.chat_id,        
            content: item.content,        
            sender: item.sender,     
            created_time: item.created_time,    
            replying: item.replying,       
            repliedCount: item.repliedCount,
            deleted:false
          } as Message
        }
      ).forEach((item: Message) => messages.push(item)); // 将获取到的消息添加到列表中
      after = messages[messages.length - 1].created_time; // 更新游标为最后一条消息的时间戳，用于下轮查询
    // 得到chat_id的after后的所有消息，返回一个Message List
    }
    catch (error) {
      console.log(info);
    }
    return messages;
}

export type AddConversationArgs = {
  isGroup :boolean;
  memberList: string[];
};

export type GetConversationsArgs = {
  userName: string;
  idList: number[];
};

// 向服务器添加一个新会话 (私聊/群聊)，memberList中的第一个用户为创建的发起者
export async function addConversation({ isGroup, memberList}: AddConversationArgs,token:string) {
  if(!isGroup){
    //if(!(memberList.length === 2)){throw new Error ('memberList not 2');}
    //TODO:handle possible error
    const createrName:string = memberList[0];
    const memberName = memberList[1];
    const { data } = await axios.post(getUrl("/api/chat/createPrivate"), {
        createrName,
        memberName,
      },{
        headers: {
            Authorization: `${token}`
        }
    });
      const { chat_id, alreadyCreated } = data.data;
      const isGroup:Boolean = false
      return {
        chat_id,
        memberList,
        isGroup
      } as Conversation;
  }
  else{
    const createrName:string = memberList[0];
    const members:string[] = memberList.slice(1);
    const { data } = await axios.post(getUrl('/api/chat/createGroup'), {
      userName: createrName,
      memberList: members,
    }, {
      headers: {
        'Authorization': `${token}`
      }
    });
    // 处理返回结果
    if(Number(data.code) === 0){
      const chat_id = data.chat_id;
      const isGroup:Boolean = true
      const owner = createrName;
      return {
        chat_id,
        memberList,
        isGroup,
        owner       // 默认创建群聊的人为群主
      } as Conversation;
    }
    else{
      // axios的错误处理方式似乎不是这样TODO
      switch(Number(data.code)){
        case 1:
          alert("Not Found");
          break;
        case 2:
          alert("Invalid or Expired JWT");
          break;
        case 3:
          alert("Group Number < 3");
          break;
        case 4:
          alert("No Friends");
      }
    }
  }
}

// 从服务器查询指定会话信息
export async function getConversations({ userName, idList,}: GetConversationsArgs ,token:string) {
  const params = new URLSearchParams();
  idList.forEach((id) => params.append('chat_id', id.toString()));
  params.append('userName',userName)
  const { data } = await axios.get(getUrl('/api/chat/chat'), {
    params,
    headers: {
      Authorization: `${token}`
    }
  });
  
  // const conversations = data.data.map((conversation: Conversation) => {
  //   // 如果isGroup为真，则设置avatar为null，否则使用conversation中的avatar属性
  //   let avatar = "default"
  //   if(!conversation.isGroup){
  //     const friendName = conversation.memberList.filter((user) => user !== userName)[0];
  //     fetch(getUrl(`/api/friendList/${userName}/${friendName}`), {
  //         method: 'GET',
  //         // 无需鉴权
  //     })
  //     .then((res) => res.json())
  //     .then((res) => {
  //         if(Number(res.code) === 0) {
  //           avatar = (res.userData.avatar);
  //         } 
  //     });
  //   }
      
  //   return { ...conversation, avatar };
  // }) as Conversation[];
  return data.data as Conversation[];
}
export const useMessageListener = (fn: () => void, me: string) => {
  useEffect(() => {
    let ws: WebSocket | null = null;
    let toReconnect:boolean = true;
    const connect = () => {
      ws = new WebSocket(
        getUrl(`ws/?username=${me}`).replace('http://', 'ws://').replace('https://','wss://') // 将http协议替换为ws协议，用于WebSocket连接
      );

      ws.onopen = () => {
        console.log('WebSocket Connected');
      };

      ws.onmessage = async (event) => {
        if (event.data) {
          const data = JSON.parse(event.data);
          if (data.type == 'notify') fn(); // 当接收到通知类型的消息时，执行回调函数
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        if(toReconnect){console.log('Attempting to reconnect...');}
        setTimeout(() => {
          if(toReconnect)connect(); // 当WebSocket连接关闭时，尝试重新连接
        }, 1000);
      };
    };

    if(me)connect();

    return () => {
      if (ws) {
        toReconnect = false;
        ws.close(); // 组件卸载时关闭WebSocket连接
      }
    };
  }, [me, fn]); // 当前用户(me)或回调函数(fn)变化时，重新执行Effect
};

export async function readMessage( userName:string, chat_id:number,after:number ,token:string) {
  let info:string=''
  try{
    const { data } = await axios.post(getUrl('/api/chat/readMessage'), {
      userName: userName,
      chat_id: chat_id,
      after:after
    }, {
      headers: {
        'Authorization': `${token}`
      }
    });
    info = data.info
    return;
  }catch (error) {
    console.log(info);
  }
  return;
}
export async function getMessageReadStatus( userName:string, message_id:number,token:string) {
  let info:string=''
  try{
    const { data } = await axios.get(getUrl("/api/chat/messageReadStatus"), {
      headers: {
        Authorization: `${token}`
      },
      params: {
        userName: userName,   
        message_id: message_id,     
      },
    });
    info = data.info
    return data.data as string[];
  }catch (error) {
    console.log(info);
  }
  return []
}
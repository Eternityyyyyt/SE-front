import React, { useState, useEffect, useCallback} from 'react';
import { Message, Conversation } from '../api/types';
import { db } from '../api/db';
import { addConversation } from '../api/chat';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import Chatbox from './ChatBox';
import {  useRequest } from 'ahooks';
import { Divider, message ,Button } from 'antd';

const HomePage = () => {
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    // 获取当前用户有的chat_id
    const [memberName, setMemberName] = useState('');
    //const [chat, setChat] = useState<Conversation>();
    const activeChatId = useSelector((state:RootState) => state.activeChat);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
    const { data: conversations, refresh } = useRequest(async () => {
      const convs = await db.conversations.toArray();
      return convs.filter((conv) => conv.memberList.includes(userName!));
    }); // 当前用户的会话列表
    
    const update = useCallback(() => {
      // 更新函数，从后端拉取消息，合并到本地数据库
      db.pullMessages(userName!,token).then(() => {
        refresh();
        setLastUpdateTime(Date.now());
      });
    }, [userName, refresh]);


    useEffect(() => {
      update();
    }, [update]);
    const activeChat = activeChatId.chat_id ?
     conversations?.find((item) => item.chat_id === activeChatId.chat_id): undefined;
    
    // // 创建私聊
    // const createPrivateChat = async() => {
    //     const newChat = await addConversation({isGroup:false, memberList:[userName,memberName]}, token); // 异步函数需要用await
    //     const chatId = newChat.chat_id;
    //     //setChat(newChat);
    //     //db.addChatId(createrName, chatId);  // 在相应表单中增加
    //     // console.log(chatId);
    // }

  return (
    <div>
        <div>
            {/* <label>Member Name:</label>
            <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} /> */}
            <label>ActiveChatID: {activeChatId.chat_id}</label>
        </div>
        <Button onClick={update}>更新数据</Button>

        {<Chatbox me={userName} conversation={activeChat} lastUpdateTime={lastUpdateTime} memberName={memberName}/>}
    </div>
  );
};

export default HomePage;

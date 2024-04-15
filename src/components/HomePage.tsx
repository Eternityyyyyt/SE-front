import React, { useState, useEffect } from 'react';
import { Message, Conversation } from '../api/types';
import { db } from '../api/db';
import { addMessage, addConversation, getMessages } from '../api/chat';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import Chatbox from './ChatBox';



const HomePage = () => {
    const createrName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    // 获取当前用户有的chat_id
    const [memberName, setMemberName] = useState('');
    const [chat, setChat] = useState<Conversation>();
    
    

    // 创建私聊
    // 异步会导致问题
    const createPrivateChat = async() => {
        const newChat = await addConversation({createrName, memberName}, token); // 异步函数需要用await
        const chatId = newChat.chat_id;
        setChat(newChat);
        // db.addChatId(createrName, chatId);  // 在相应表单中增加
        console.log(chatId);
    }
    

  

  return (
    <div>
        <div>
            <label>Member Name:</label>
            <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} />
        </div>
        <button onClick={createPrivateChat}>创建聊天</button>
        {chat && <Chatbox me={createrName} conversation={chat}/>}
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { Message, Conversation } from '../api/types';
import { db } from '../api/db';
import { addMessage, addConversation, getMessages } from '../api/chat';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';



const HomePage = async() => {
    const createrName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    // 获取当前用户有的chat_id
    const [memberName, setMemberName] = useState('');
    const chatIds = await db.getUserId(createrName);
    const idList = chatIds?.chatIds;
    if(idList) {

    } else {
        
    }
    

    // 创建私聊
    const createPrivateChat = async() => {
        const newChat = await addConversation({createrName, memberName}, token); // 异步函数需要用await
        const chatId = newChat.chat_id;
        db.addChatId(createrName, chatId);  // 在相应表单中增加
        console.log(chatId);
    }

  

  return (
    <div>
        <div>
            <label>Member Name:</label>
            <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} />
        </div>
        <button onClick={createPrivateChat}>创建聊天</button>
    </div>
  );
};

export default HomePage;

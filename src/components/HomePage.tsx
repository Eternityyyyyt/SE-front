import React, { useState, useEffect, useCallback} from 'react';
import { Message, Conversation } from '../api/types';
import { db } from '../api/db';
import styles from './HomePage.module.css';
import { addConversation,useMessageListener, } from '../api/chat';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import ConversationSelection from './ConversationSelection';
import Chatbox from './ChatBox';
import {  useRequest } from 'ahooks';
import { Divider, message ,Button } from 'antd';
import { useDispatch } from "react-redux";
import { setActiveChat } from '@/redux/activeChat';

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
    const dispatch = useDispatch();
    const update = useCallback(() => {
      // 更新函数，从后端拉取消息，合并到本地数据库
      db.pullMessages(userName!,token).then(() => {
        refresh();
        setLastUpdateTime(Date.now());
      });
    }, [userName, refresh]);


    useEffect(() => {
      update();
      const intervalId = setInterval(update, 3000);

    // 组件卸载时清除定时器
      return () => clearInterval(intervalId);
    }, []);
    const activeChat = activeChatId.chat_id ?
     conversations?.find((item) => item.chat_id === activeChatId.chat_id): undefined;

     
    useEffect(() => {
      db.activeConversationId = activeChatId.chat_id;
      if(activeChat){
        db.clearUnreadCount(activeChat).then(refresh);
      }

    },[activeChat, refresh])
    
    //useMessageListener(update, userName!); // 使用消息监听器钩子，当有新消息时调用更新函数

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.settings}> 

          <div className={styles.conversations}>
            <ConversationSelection // 会话选择组件
              me={userName}
              conversations={conversations || []}
              onSelect={(id) => dispatch(setActiveChat(id))}
            />
          </div>
        </div>
          <Chatbox me={userName} conversation={activeChat} lastUpdateTime={lastUpdateTime} memberName={memberName}/>
      </div>
      {/* <Button onClick={update}>更新数据</Button> */}
    </div>
    

    
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge } from 'antd';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './ConversationSelection.module.css';
import { Conversation } from '../api/types';
import { getConversationDisplayName,getPrivateConversationDisplayAvatar , formattime} from '../api/utils';
import { db} from '../api/db';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

type ConversationSelectionProps = {
  me: string; // 当前用户
  conversations: Conversation[]; // 会话列表
  onSelect: (conversationId: number) => void; // 选择会话时的回调函数
};

// 会话选择组件
const ConversationSelection: React.FC<ConversationSelectionProps> = ({
  me,
  conversations,
  onSelect,
}) => {

  function truncateString(str: string, maxLength: number = 6): string {
      if (str.length > maxLength) {
        return str.slice(0, maxLength) + '..';
      }
      return str;
    }
    
  
  const [avatars, setAvatars] = useState<Record<number, string>>({});
  const token = useSelector((state:RootState) => state.auth.token);
  const [latestMessages, setLatestMessages] = useState<Record<number, string>>({});
  const [latestMessagesTime, setLatestMessagesTime] = useState<Record<number, number>>({});
  const [activeChatID, setActiveChatID] = useState(1)
  // useEffect(()=>{
  //   conversations = conversations.sort((a,b) => latestMessagesTime[b.chat_id] - latestMessagesTime[a.chat_id])
  // }
  //)
  
  useEffect(()=>{
    const getLatestMessages= async () => {
      if(conversations.length > 0){
        const newLatestMessage:Record<number, string>= {};
        const newLatestMessageTime:Record<number, number>= {};
        for (const conversation of conversations) {
          // if (!conversation.isGroup) {
            await db.getCachedMessages(conversation)
            .then((messages) => {
              const latestmessage = messages.sort((a, b) => b.created_time - a.created_time)[0]
              if( latestmessage){
                newLatestMessage[conversation.chat_id] = truncateString(latestmessage.content)
                newLatestMessageTime[conversation.chat_id] = latestmessage.created_time
              }
              else{
                newLatestMessage[conversation.chat_id] = ''
                newLatestMessageTime[conversation.chat_id] = 0
              }
            })
          // }
        }
        setLatestMessages(newLatestMessage);
        setLatestMessagesTime(newLatestMessageTime);
     }
    };
    getLatestMessages()
  }
  )
  useEffect(() => {
    //console.log('triggerd useeffect')
    const fetchAvatars = async () => {
      const newAvatars:Record<number, string>= {};
      //console.log(conversations)
      //conversations = conversations.sort((a,b) => latestMessagesTime[b.chat_id] - latestMessagesTime[a.chat_id])
      for (const conversation of conversations) {
        //console.log(conversation)
        if (!conversation.isGroup) {
          // 假设getPrivateConversationDisplayAvatar返回一个Promise
          //console.log(conversation.chat_id)
          newAvatars[conversation.chat_id] = await getPrivateConversationDisplayAvatar(conversation, me);
        }
      }
      //console.log(newAvatars)
      setAvatars(newAvatars);
    };
    fetchAvatars()
  }, [activeChatID,conversations.length]);
  const selectchat = async (chat_id:number) => {
    setActiveChatID(chat_id)
    await db.updateConversation(me,chat_id,token);
    onSelect(chat_id)
  }
  //conversations.sort((a,b) => latestMessagesTime[b.chat_id] - latestMessagesTime[a.chat_id])s
  return (
    <List
      itemLayout="horizontal"
      dataSource={conversations.slice(0).sort((a,b) => latestMessagesTime[b.chat_id] - latestMessagesTime[a.chat_id])} // 数据源为当前用户的会话列表
      renderItem={(item) => (
        <List.Item
          onClick={() => selectchat(item.chat_id)} // 点击会话项时触发onSelect回调
          className={styles.listItem}
        >
          <List.Item.Meta
            className={styles.listItemMeta}
            avatar={
              item.isGroup ? 
              // 会话项的头像，根据会话类型显示不同图标
              <Badge count={item.unreadCount || 0}>
                <Avatar
                  icon={
                    (
                      <TeamOutlined /> // 群聊使用团队图标
                    )
                  }
                />
              </Badge> :
              <Badge count={item.unreadCount || 0}>
              <Avatar
                src={avatars[item.chat_id]}
              />
            </Badge>
            }
            title={`${getConversationDisplayName(item,me)}`}
            description={
              !item.isGroup ? (
                <div className={styles.membersList}>
                  {/* {item.memberList.filter((user) => user !== me)} */}
                  <p>{latestMessages[item.chat_id]}      （{formattime(latestMessagesTime[item.chat_id])}）</p>
                  
                </div>
              ) : (
                <div className={styles.membersList}>
                  {item.memberList.join(', ')}
                  <p>{latestMessages[item.chat_id]}      （{formattime(latestMessagesTime[item.chat_id])}）</p>
                </div>
                
              )
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ConversationSelection;

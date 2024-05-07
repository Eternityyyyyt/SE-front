import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge } from 'antd';
import { MessageOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './ConversationSelection.module.css';
import { Conversation } from '../api/types';
import { getConversationDisplayName,getPrivateConversationDisplayAvatar} from '../api/utils';
import { db } from '../api/db';


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
  function formattime(timestamp:number) {
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
    return `（${formattedTime}）`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "（昨天）";
    } else if (date.toDateString() === dayBeforeYesterday.toDateString()) {
      return "（前天）";
    } else {
      // 否则显示具体日期（只需要月份和年份）
      return `（${date.getMonth() + 1}月${date.getDate()}日）`;
    }
  }
    
  
  const [avatars, setAvatars] = useState<Record<number, string>>({});
  
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
          if (!conversation.isGroup) {
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
          }
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
        console.log(conversation)
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
  const selectchat = (chat_id:number) => {
    setActiveChatID(chat_id)
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
              // // 会话描述部分显示最新消息
              // !item.isGroup ? (
              //   <div className={styles.membersList}>
              //     {item.memberList.filter((user) => user !== me)}
              //     {/* 私聊时过滤掉当前用户，只显示对方用户名 */}
              //   </div>
              // ) : (
              //   <div className={styles.membersList}>
              //     {item.memberList.join(', ')}
              //     {/* 群聊时显示所有成员用户名，以逗号分隔 */}
              //   </div>
              // )
              `${latestMessages[item.chat_id]}      ${formattime(latestMessagesTime[item.chat_id])}`
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ConversationSelection;

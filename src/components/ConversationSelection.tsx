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
    const seconds = Math.floor(timestamp);
    // 格式化时间戳为易读的时间格式
    //console.log(timestamp)
    const formattedTime = new Date(seconds * 1000).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return formattedTime
  }
  const [avatars, setAvatars] = useState<Record<number, string>>({});
  const [latestMessages, setLatestMessages] = useState<Record<number, string>>({});
  const [latestMessagesTime, setLatestMessagesTime] = useState<Record<number, number>>({});
  const [activeChatID, setActiveChatID] = useState(1)
  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars:Record<number, string>= {};
      for (const conversation of conversations) {
        if (!conversation.isGroup) {
          // 假设getPrivateConversationDisplayAvatar返回一个Promise
          newAvatars[conversation.chat_id] = await getPrivateConversationDisplayAvatar(conversation, me);
        }
      }
      setAvatars(newAvatars);
    };

    fetchAvatars();
    const getLatestMessages= async () => {
      const newLatestMessage:Record<number, string>= {};
      const newLatestMessageTime:Record<number, number>= {};
      for (const conversation of conversations) {
        if (!conversation.isGroup) {
          await db.getCachedMessages(conversation)
          .then((messages) => {
            const latestmessage = messages.sort((a, b) => b.created_time - a.created_time)[0]
            newLatestMessage[conversation.chat_id] = truncateString(latestmessage.content)
            newLatestMessageTime[conversation.chat_id] = latestmessage.created_time
          })
        }
      }
      setLatestMessages(newLatestMessage);
      setLatestMessagesTime(newLatestMessageTime);
    };
    getLatestMessages()
  }, [activeChatID]);
  const selectchat = (chat_id:number) => {
    setActiveChatID(chat_id)
    onSelect(chat_id)
  }
  conversations = conversations.sort((a,b) => latestMessagesTime[b.chat_id] - latestMessagesTime[a.chat_id])
  return (
    <List
      itemLayout="horizontal"
      dataSource={conversations} // 数据源为当前用户的会话列表
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
              `${latestMessages[item.chat_id]}     (${formattime(latestMessagesTime[item.chat_id])})`
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ConversationSelection;

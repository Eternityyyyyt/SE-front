import React, { useState } from 'react';
import styles from './MessageBubble.module.css';
import { time } from 'console';
import { Avatar } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import type { MenuProps } from 'antd';
import { Dropdown, theme ,Modal , Button} from 'antd';
import { db} from '../api/db';
export type MessageBubbleProps = {
  message_id:number;
  sender: string; // 消息发送者
  content: string; // 消息内容
  timestamp: number; // 消息时间戳
  isMe: boolean; // 判断消息是否为当前用户发送
  avatarPath:string//头像
};

// 消息气泡组件
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message_id,
  sender,
  content,
  timestamp,
  isMe,
  avatarPath,
}) => {
  const [shouldRender, setShouldRender] = useState(true);
  const seconds = Math.floor(timestamp);
  // 格式化时间戳为易读的时间格式
  //console.log(timestamp)
  const formattedTime = new Date(seconds * 1000).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const my_avatar = useSelector((state:RootState) => state.auth.avatar);
  const my_avatarPath:string = `..${my_avatar}`;
  const [visibleReadMembers,setVisibleReadMembers] = useState(false)
  if(!shouldRender){return null;}
  const items: MenuProps['items'] = [
    {
      label: '回复',
      key: '1',
    },
    {
      label: '删除',
      key: '2',
    },
    {
      label: '查看已读成员',
      key: '3',
    },
  ];
  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key === '2') {
      await db.messages.update(message_id,{deleted:true});
      setShouldRender(false);
    }
    if (e.key === '3') {
      setVisibleReadMembers(true)
    }

  };
  return (
    <div className={`${styles.container} ${isMe ? styles.me : styles.others}`}>
      {/* 根据消息发送者显示不同的气泡样式 */}
      <div>
      <Avatar src={ avatarPath }></Avatar>
      </div>
      
        <div className={styles.sender}>
          {sender} @ {formattedTime} {/* 显示发送者和消息时间 */}
        </div>
        <Dropdown menu={{ items,onClick: handleMenuClick, }} trigger={['contextMenu']}>
        <div
          className={`${styles.bubble} ${
            isMe ? styles.meBubble : styles.othersBubble
          }`}
        >
          {content} {/* 显示消息内容 */}
        </div>
      </Dropdown>
      <Modal
          title="已读成员列表"
          visible={visibleReadMembers}
          onCancel={() => setVisibleReadMembers(false)}
          footer={[
            <Button key="cancel" onClick={() => setVisibleReadMembers(false)}>关闭</Button>,
          ]}
          >已读成员列表
            
        </Modal>
    </div>
  );
};

export default MessageBubble;

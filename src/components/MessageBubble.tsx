import React, { useState } from 'react';
import styles from './MessageBubble.module.css';
import { time } from 'console';
import { Avatar } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import type { MenuProps } from 'antd';
import { Dropdown, theme ,Modal , Button} from 'antd';
import { db} from '../api/db';
import {getMessageReadStatus} from '../api/chat'
export type MessageBubbleProps = {
  message_id:number;
  sender: string; // 消息发送者
  content: string; // 消息内容
  timestamp: number; // 消息时间戳
  isMe: boolean; // 判断消息是否为当前用户发送
  avatarPath:string//头像
  setReplying:any,
  replyingContent:string,
  scrollToReply:any,
  replying:number
};

// 消息气泡组件
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message_id,
  sender,
  content,
  timestamp,
  isMe,
  avatarPath,
  setReplying,
  replyingContent,
  scrollToReply,
  replying
}) => {
  const [shouldRender, setShouldRender] = useState(true);
  const seconds = Math.floor(timestamp);
  // 格式化时间戳为易读的时间格式
  //console.log(timestamp)
  const date = new Date(seconds*1000);
  const formattedTime = new Date(seconds * 1000).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const token = useSelector((state:RootState) => state.auth.token);
  const userName = useSelector((state:RootState) => state.auth.name);
  const [repliedCount ,setRepliedCount] = useState(0)
  const [visibleReadMembers,setVisibleReadMembers] = useState(false)
  const [readMemberList,setReadMemberList] = useState<string[]>([])
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
      label: '查看详细',
      key: '3',
    },
  ];
  const replyMenu: MenuProps['items'] = [
    {
      label: '定位到原文位置',
      key: '4',
    },
    
  ];
  
  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key === '1') {
      setReplying(message_id);
    }
    if (e.key === '2') {
      await db.messages.update(message_id,{deleted:true});
      setShouldRender(false);
    }
    if (e.key === '3') {
      await getMessageReadStatus(userName,message_id,token)
      .then(([list,repl]) =>{ 
        setRepliedCount(repl)
        setReadMemberList(list)
      })

      setVisibleReadMembers(true)
    }
    if (e.key === '4'){
      scrollToReply(replying)
    }

  };
  return (
    <div className={`${styles.container} ${isMe ? styles.me : styles.others}`}>
      {/* 根据消息发送者显示不同的气泡样式 */}
      <div>
      <Avatar src={ avatarPath }></Avatar>
      </div>
      
        <div className={styles.sender}>
          {sender} @{` ${date.getMonth()+1}月${date.getDate()}日 `} {formattedTime} {/* 显示发送者和消息时间 */}
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
        {!replyingContent ? null :
          <Dropdown menu={{ items:replyMenu,onClick: handleMenuClick, }} trigger={['click']}>
            <div
              className={`${styles.replyBubble}`}
            >
              {replyingContent} {/* 显示消息内容 */}
            </div>
          </Dropdown>
        }
      <Modal
          title="消息详细信息"
          visible={visibleReadMembers}
          onCancel={() => setVisibleReadMembers(false)}
          footer={[
            <Button key="cancel" onClick={() => setVisibleReadMembers(false)}>关闭</Button>,
          ]}
          ><div>已读成员：{readMemberList.join(',')}</div>
            <div>该消息被回复次数：{repliedCount}</div>
        </Modal>
    </div>
  );
};

export default MessageBubble;

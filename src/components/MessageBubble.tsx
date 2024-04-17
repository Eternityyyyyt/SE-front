import React from 'react';
import styles from './MessageBubble.module.css';
import { time } from 'console';

export type MessageBubbleProps = {
  sender: string; // 消息发送者
  content: string; // 消息内容
  timestamp: number; // 消息时间戳
  isMe: boolean; // 判断消息是否为当前用户发送
};

// 消息气泡组件
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  content,
  timestamp,
  isMe,
}) => {
  const seconds = Math.floor(timestamp);
  // 格式化时间戳为易读的时间格式
  console.log(timestamp)
  const formattedTime = new Date(seconds * 1000).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={`${styles.container} ${isMe ? styles.me : styles.others}`}>
      {/* 根据消息发送者显示不同的气泡样式 */}
      <div className={styles.sender}>
        {sender} @ {formattedTime} {/* 显示发送者和消息时间 */}
      </div>
      <div
        className={`${styles.bubble} ${
          isMe ? styles.meBubble : styles.othersBubble
        }`}
      >
        {content} {/* 显示消息内容 */}
      </div>
    </div>
  );
};

export default MessageBubble;

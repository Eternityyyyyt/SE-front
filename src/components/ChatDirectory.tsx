import React from "react";
import styles from '../styles/chatStyles.module.css';
const ChatDirectory:React.FC<{}> = () => {
    return (
        <div className={styles['chat-directory']}>
            <h2>好友列表</h2>
            <div className={styles['chat-room']}>
            张皓晨
            </div>
            <div className={styles['chat-room']}>
            周子恒
            </div>
            <div className={styles['chat-room']}>
            俞鹤扬
            </div>
            <div className={styles['chat-room']}>
            郑凯天
            </div>
        </div>
    );
};
export default ChatDirectory;
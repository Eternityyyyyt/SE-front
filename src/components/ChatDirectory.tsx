import React from "react";
import styles from '../styles/chatStyles.module.css';
const ChatDirectory:React.FC<{}> = () => {
    return (
        <div className={styles['chat-directory']}>
            <h2>好友列表</h2>
            <div className={styles['chat-room']}>
            张皓晨demo
            </div>
            <div className={styles['chat-room']}>
            周子恒demo
            </div>
            <div className={styles['chat-room']}>
            俞鹤扬demo
            </div>
            <div className={styles['chat-room']}>
            郑凯天demo
            </div>
        </div>
    );
};
export default ChatDirectory;
import React from "react";
import styles from '../styles/chatStyles.module.css';
const ChatDirectory:React.FC<{}> = () => {
    return (
        <div className={styles['chat-directory']}>
            <h2>Chat Directory</h2>
            <div className={styles['chat-room']}>
            Chat Room 1
            </div>
            <div className={styles['chat-room']}>
            Chat Room 2
            </div>
            <div className={styles['chat-room']}>
            Chat Room 3
            </div>
            <div className={styles['chat-room']}>
            Chat Room 4
            </div>
        </div>
    );
};
export default ChatDirectory;
import React from "react";
import styles from '../styles/chatStyles.module.css'

const ChatWindow: React.FC<{}> = () => {
    return (
        <div className={styles['chat-window']}>
            <h2>聊天界面</h2>
            <div className={styles['chat-bubble']}>
            <span className={styles['sender-name']}>YOU</span>
            <p className={styles['message-content']}>Hello there!</p>
            </div>
            <div className={styles['chat-bubble']}>
            <span className={styles['sender-name']}>ME</span>
            <p className={styles['message-content']}>How are you?</p>
            </div>
            <div className={styles['chat-bubble']}>
            <span className={styles['sender-name']}>YOU</span>
            <p className={styles['message-content']}>Im fine, thank you!</p>
            </div>
            <div className={styles['chat-bubble']}>
            <span className={styles['sender-name']}>ME</span>
            <p className={styles['message-content']}>Great!</p>
            </div>
        </div>
    );
};

export default ChatWindow;
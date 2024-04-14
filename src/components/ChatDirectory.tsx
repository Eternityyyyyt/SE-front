import React, {useState} from "react";
import styles from '../styles/chatStyles.module.css';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ChatDirectory:React.FC<{}> = () => {
    const chatIds = useSelector((state: RootState) => state.auth.chatId);
    const messages = useSelector((state: RootState) => state.auth.messages);



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
            <ul>
                {chatIds.map((chatId, index) => (
                    <li key={index}>
                        <div className={styles['chat-room']}>
                            Chat ID: {chatId}
                        </div>
                        
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default ChatDirectory;
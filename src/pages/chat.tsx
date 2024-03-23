import ChatDirectory from "@/components/ChatDirectory";
import ChatWindow from "@/components/ChatWindow";
import styles from '../styles/chatStyles.module.css'

const ChatPage = () => {
  return (
    <div>
    <h1>聊天界面</h1>
    <div className={styles['chat-container']}>
      <ChatDirectory />
      <ChatWindow />
    </div>
  </div>
  );
};

export default ChatPage;
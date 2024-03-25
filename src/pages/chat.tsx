import ChatDirectory from "@/components/ChatDirectory";
import ChatWindow from "@/components/ChatWindow";
import styles from '../styles/chatStyles.module.css'
import { useRouter } from "next/router";


const ChatPage = () => {
  const router = useRouter();
  
  const myCenter = async() => {
    const token = localStorage.getItem('token');
    //tmp
    const userName = localStorage.getItem('userName');
    const password = localStorage.getItem('password');

    if(!token) {
      router.push('/login');
      return;
    };
    // TODO
    try {
      const response = await fetch(`/api/user/${userName}`, {
        method: 'GET',
        headers: {
          'Authorization': `${token}` // 发送本地token到后端
        },
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('phoneNumber', data.phoneNumber);
        localStorage.setItem('email', data.email);
        router.push('/myCenter')
      } else {

      }

      
      
      
    } 
    catch (error) {
      console.error('Error checking token:', error);
      alert('发生错误，请重试。');
    }

  };

  return (
    <div>
      <div className={styles['chat-container']}>
        <ChatDirectory />
        <ChatWindow />
      </div> 
      <button onClick={myCenter}>个人用户中心</button>
  </div>
  );
};

export default ChatPage;
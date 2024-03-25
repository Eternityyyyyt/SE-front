import ChatDirectory from "@/components/ChatDirectory";
import ChatWindow from "@/components/ChatWindow";
import styles from '../styles/chatStyles.module.css'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";
import localforage from "localforage";


const ChatPage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
        try {
            setUserName(await localforage.getItem('userName'));
            setToken(await localforage.getItem('token'));
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    fetchUserData();
}, []);


  const MyCenter = async() => {
    
    console.log(userName);
    console.log(token);

    if(!token) {
      router.push('/login');
      return;
    };
    try {
      const response = await fetch(`/api/user/${userName}`, {
        method: 'GET',
        headers: {
          'Authorization': `${token}` // 发送本地token到后端
        },
      });
      if (response.ok) {
        const data = await response.json();
        localforage.setItem('phoneNumber', data.phoneNumber);
        localforage.setItem('email', data.email);
        router.push('/MyCenter')
      } else {
        const data = await response.json();
        switch(data.info) {
          case 'Invalid or expired JWT':
            alert('非法JWT令牌');
            break;
          case 'User not found':
            alert('用户不存在');
            break;
          case 'Cannot view info of other users':
            alert('不能查看其他用户信息');
            break;
          default:
            alert(data.error.message);
        };

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
      <button onClick={MyCenter}>个人用户中心</button>
  </div>
  );
};

export default ChatPage;
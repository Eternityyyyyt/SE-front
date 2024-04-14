import ChatDirectory from "@/components/ChatDirectory";
import ChatWindow from "@/components/ChatWindow";
import styles from '../styles/chatStyles.module.css'
import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setPhoneNumber, setEmail, setNickname, resetAuth } from "@/redux/auth";


const ChatPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state:RootState) => state.auth.token);
  const userName = useSelector((state:RootState) => state.auth.name);

  
  
  useEffect(() => {
    if(token && userName) {
      // MyCenter();
    } else {
      router.push('/login');
    }
  }, [token, userName]);


  const MyCenter = () => {
    fetch(`/api/user/${userName}`,{
      method: 'GET',
      headers: {
        'Authorization': `${token}` // 发送本地token到后端
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if(Number(res.code) === 0) {
          console.log(res.code);
          dispatch(setPhoneNumber(res.userData.phoneNumber));
          dispatch(setEmail(res.userData.email));
          dispatch(setNickname(res.userData.nickname));
          router.push('/MyCenter');
        }
        else {
          switch(Number(res.code)) {
            case 2:
              alert('非法JWT令牌');
              break;
            case 1:
              alert('用户不存在');
              break;
            case 3:
              alert('不能查看其他用户信息');
              break;
            default:
              alert("Something Wrong!");
              console.log(res.code);
          };
        }
      });

  };

  const SearchUser = () => {
    router.push('/search');
  };

  const FriendRequestList = () => {
    router.push('/friendRequestList');
  };
  const gotoIndex = () => {
    dispatch(resetAuth());
    router.push('/');
  };
  const FriendList = () => {
    router.push('/friendList');
  };

  // 创建私聊
  const createPrivateChat = () => {
    router.push('createPrivate')
  };

  return (
    <div>
      <div className={styles['chat-container']}>
        <ChatDirectory />
        <ChatWindow />
      </div> 
      <div>
        <button onClick={createPrivateChat}>创建私聊</button>
      </div>
      <div>
        <button onClick={FriendRequestList}>好友申请列表</button>
        <button onClick={FriendList}>好友列表</button>
        <button onClick={MyCenter}>个人用户中心</button>
        <button onClick={SearchUser}>搜索用户</button>
        <button onClick={gotoIndex}>退出登录</button>
      </div>
      
  </div>
  );
};

export default ChatPage;
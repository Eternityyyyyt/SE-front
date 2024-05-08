import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setActiveChat } from "../redux/activeChat";
import styles from './chat.module.css';
const HomePage = dynamic(() => import('@/components/HomePage'), { ssr: false });
const Buttons = dynamic(() => import('@/components/Buttons'), { ssr: false });

const ChatPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state:RootState) => state.auth.token);
  const userName = useSelector((state:RootState) => state.auth.name);

  
  
  useEffect(() => {
    if(token && userName) {
      // MyCenter();
    } else {
      dispatch(setActiveChat(null))
      router.push('/login');
    }
  }, [token, userName]);

  return (
    <div className={styles.homepage}>
      <HomePage />
      <Buttons />
  </div>
  );
};

export default ChatPage;
// 好友列表页面
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import { useRouter } from 'next/router';
import styles from './avatar.module.css';
import { setActiveChat } from "../redux/activeChat";
import { addConversation, } from '../api/chat';
import { db } from '../api/db';
import { setFriendName,setFriendNickname, setFriendAvatar } from '@/redux/friend';

interface FriendDataList {
    userName: string;
    nickname: string;
    avatar: string;
}

const FriendList = () => {
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    const [friendDataList, setFriendDataList] = useState<FriendDataList[]>([]);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await fetch(`/api/friendList/${userName}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`
                    },
                });
                const data = await response.json();
                if(Number(data.code) === 0) {
                    setFriendDataList(data.friendDataList);
                } else {
                    switch(Number(data.code)) {
                        case 2:
                            alert("Invalid or expired JWT");
                            break;
                        case 3:
                            alert("Can not view other's friend list");
                            break;
                        default:
                            alert("Something Wrong!");
                            break;
                    }
                } 
            } catch(error) {
                console.error('Error')
            }
        };
        fetchData();
    }, [userName]);

    const GoBack = () => {router.push(`/chat`);};
    const GetFriendData = (userName: string, nickname:string, avatar:string) => {
        dispatch(setFriendName(userName));
        dispatch(setFriendNickname(nickname));
        dispatch(setFriendAvatar(avatar));
        router.push(`/friendData/`);
    };

    const GoToChat = async(friendName:string) => {
        const newChat = await addConversation({isGroup:false, memberList:[userName,friendName]}, token);; // 异步函数需要用await
        const chatId = newChat.chat_id;
        console.log(chatId);
        await db.pullConversations(userName,[chatId],token);
        dispatch(setActiveChat(chatId));
        router.push('/chat');
    };
    return (
        <div>
            <button onClick={GoBack}>返回</button>
            {friendDataList.length === 0 ? (
                <p>No Friend</p>
            ): (
                <ul>
                    {friendDataList.map((request) => (
                        <li key={request.nickname}>
                            <div>
                                {<img src={`..${request.avatar}`} alt="Avatar" className={styles.avatar} />}
                            </div>

                            <p>UserName: {request.userName}</p>
                            <p>Nickname: {request.nickname}</p>
                            <button onClick={() => GoToChat(request.userName)}>聊天</button>
                            <button onClick={() => GetFriendData(request.userName , request.nickname, request.avatar)}>查看详细信息</button>
                        </li>
                        
                    ))}
                </ul>
            )}
        </div>
    )
}

export default FriendList;
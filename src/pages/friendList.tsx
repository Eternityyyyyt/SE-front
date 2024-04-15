// 好友列表页面
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import { useRouter } from 'next/router';

import { setFriendName,setFriendNickname } from '@/redux/friend';

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
    const GetFriendData = (userName: string,nickname:string) => {
        dispatch(setFriendName(userName));
        dispatch(setFriendNickname(nickname));      // 将点击对应的用户nickname存储在前端
        router.push(`/friendData/`);
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
                            {/* 头像还没有 */}
                            <p>UserName: {request.userName}</p>
                            <p>Avatar: {request.avatar}</p>
                            <p>Nickname: {request.nickname}</p>
                            <button onClick={() => GetFriendData(request.userName , request.nickname)}>查看详细信息</button>
                        </li>
                        
                    ))}
                </ul>
            )}
        </div>
    )
}

export default FriendList;
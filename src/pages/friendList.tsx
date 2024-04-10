// 好友列表页面
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import { useRouter } from 'next/router';


interface FriendDataList {
    nickname: string;
    avatar: string;
}

const FriendList = () => {
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    const [friendList, setFriendList] = useState<FriendDataList[]>([]);
    const router = useRouter();

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
                    setFriendList(data.FriendDataList);
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

    const GoBack = () => {router.back();};
    return (
        <div>
            <button onClick={GoBack}>返回</button>
            {friendList.length === 0 ? (
                <p>No Friend</p>
            ): (
                <ul>
                    {friendList.map((request) => (
                        <li>
                            <p>Nickname: {request.nickname}</p>
                            {/* 头像还没有 */}
                            <p>Avatar: {request.avatar}</p>
                        </li>
                        
                    ))}
                </ul>
            )}
        </div>
    )
}

export default FriendList;
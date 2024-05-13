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
import { getUrl } from '../api/utils';
import {Button, List, Avatar, Modal, Input} from 'antd';
import axios from 'axios';
interface FriendDataList {
    userName: string;
    nickname: string;
    avatar: string;
}
interface Tag {
    tag_id: number;
    tagName: string;
    inTagUserList: string[];
}

const FriendList = () => {
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    const [friendDataList, setFriendDataList] = useState<FriendDataList[]>([]);
    const router = useRouter();
    const dispatch = useDispatch();

    // friend tag
    const [selectedNewTagFriend, setSelectedNewTagFriend] = useState<string[]>([]);
    const [friendTagList, setFriendTagList] = useState<Tag[]>([]);
    const [tagName, setTagName] = useState('');
    const [visibleTag, setVisibleTag] = useState(false);
    const [visibleNewTag, setVisibleNewTag] = useState(false);
    const [visibleViewTag, setVisibleViewTag] = useState(false);
    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await fetch(getUrl(`/api/friendList/${userName}`), {
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

    const GoBack = () => {router.push(`/chat`);}
    const frindTag = () => {
        setVisibleTag(true);
    }
    const handleCancel = () => {
        setVisibleTag(false);
    };
    
    // 新建好友标签
    const newTag = () => {
        setVisibleNewTag(true);
    };
    const setInNewTag = (friendName: string) => {
        if(selectedNewTagFriend.includes(friendName)) {
            setSelectedNewTagFriend(selectedNewTagFriend.filter(item => item !== friendName));
        }
        else {
            setSelectedNewTagFriend([...selectedNewTagFriend, friendName]);
        }
    };
    const handleNewTagCancel = () => {
        setVisibleNewTag(false);
        setSelectedNewTagFriend([]);
        setTagName('');
    };
    const handleNewTagOk = async () => {
        if(!tagName) {
            alert("Tag name cannot be empty!");
            return;
        }
        console.log(tagName);
        const {data} = await axios.post(getUrl("/api/setFriendTag"), {
            userName: userName,
            tagName: tagName,
            friendList: selectedNewTagFriend
        },{
            headers: {
                'Authorization': `${token}`
            }
        }); 
        setSelectedNewTagFriend([]);
        setTagName('');
    };

    // 删除好友标签
    const deleteTag = () => {}
    // 查看好友标签
    const viewTag = async() => {
        const {data} = await axios.get(getUrl("/api/friendTag"), {
            headers: {
                Authorization: `${token}`
            },
            params: {
                userName: userName,
            }
        });
        setFriendTagList(data.data);
        setVisibleViewTag(true);
    };
    const handleViewTagCancel = () => {
        setFriendTagList([]);
        setVisibleViewTag(false);
    };
    // 添加好友到标签
    const addFriendToTag = () => {}
    // 移除标签中的好友
    const removeFriendFromTag = () => {}
    const GetFriendData = (userName: string, nickname:string, avatar:string) => {
        dispatch(setFriendName(userName));
        dispatch(setFriendNickname(nickname));
        dispatch(setFriendAvatar(avatar));
        router.push(`/friendData/`);
    };

    const GoToChat = async(friendName:string) => {
        const newChat = await addConversation({isGroup:false, memberList:[userName,friendName]}, token);; // 异步函数需要用await
        if(newChat){
            const chatId = newChat.chat_id;
            console.log(chatId);
            await db.pullConversations(userName,[chatId],token);
            dispatch(setActiveChat(chatId));
            router.push('/chat');
        }
    };
    return (
        <div>
            <Button onClick={GoBack}>返回</Button>
            <Button onClick={frindTag}>标签</Button>
            {friendDataList.length === 0 ? (
                <p>No Friend</p>
            ): (
                <ul>
                    {friendDataList.map((request) => (
                        <li key={request.userName}>
                            <div>
                                {<img src={`..${request.avatar}`} alt="Avatar" className={styles.avatar} />}
                            </div>

                            <p>UserName: {request.userName}</p>
                            <p>Nickname: {request.nickname}</p>
                            <Button  type='dashed' onClick={() => GoToChat(request.userName)}>聊天</Button>
                            <Button type='dashed' onClick={() => GetFriendData(request.userName , request.nickname, request.avatar)}>查看详细信息</Button>
                        </li>
                        
                    ))}
                </ul>
            )}

            <Modal
                title="好友标签"
                visible={visibleTag}
                onCancel={handleCancel}
                footer = {[
                    <Button key="cancel" onClick={handleCancel}>取消</Button>
                ]}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Button key="memberList" type="primary" onClick={newTag}>新建好友标签</Button>
                <Button key="setAdmin" type="link" onClick={deleteTag}>删除好友标签</Button>
                <Button key="setOwner" type="link" onClick={viewTag}>查看好友标签</Button>
                <Button key="removeMember" type="link" onClick={addFriendToTag}>添加好友到标签</Button>
                <Button key="withdraw" type="link" onClick={removeFriendFromTag}>移除标签中的好友</Button>
                </div>
                
            </Modal>
            <Modal
                title="新建好友标签"
                visible={visibleNewTag}
                onCancel={handleNewTagCancel}
                footer = {[]}
            >
                <Input placeholder='输入标签名' onChange={(event)=>setTagName(event.target.value)}></Input>
                <p></p>
                <p>选择好友: {selectedNewTagFriend.join(', ')}</p>
                <List
                bordered
                dataSource={friendDataList}
                renderItem={(item, index)=>(
                    <List.Item key={index} actions={[
                        <Button key="set" type="primary" onClick={()=>setInNewTag(item.userName)}>选择</Button>
                    ]}>
                        {<Avatar src={item.avatar}></Avatar>} {item.userName}
                    </List.Item>
                )}
                />
                <p></p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Button type='primary' onClick={handleNewTagOk}>创建</Button>
                </div>
                

            </Modal>
            <Modal
                title="好友标签信息"
                visible={visibleViewTag}
                onCancel={handleViewTagCancel}
                footer = {[]}
            >
                <List
                bordered
                dataSource={friendTagList}
                renderItem={(item, index)=>(
                    <List.Item key={item.tag_id}>
                       <b>{item.tagName}</b>: {item.inTagUserList.join(', ')}
                    </List.Item>
                )}
                />
            </Modal>

                

                
        </div>
    )
}

export default FriendList;
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
import dynamic from 'next/dynamic';
const Tag = dynamic(() => import('../components/Tag'), { ssr: false });

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
    const [selectedDeleteTag, setSelectedDeleteTag] = useState('');
    const [friendTagList, setFriendTagList] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag>();
    const [selectedNewFriendList, setSelectedNewFriendList] = useState<string[]>([]);
    const [selectedRemoveFriendList, setSelectedRemoveFriendList] = useState<string[]>([]);
    const [tagName, setTagName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    // Modal 是否可见
    const [visibleTag, setVisibleTag] = useState(false);                // 标签相关操作
    const [visibleNewTag, setVisibleNewTag] = useState(false);          // 新建标签
    const [visibleViewTag, setVisibleViewTag] = useState(false);        // 显示所有标签信息
    const [visibleDeleteTag, setVisibleDeleteTag] = useState(false);    // 删除标签
    const [visibleEditTag, setVisibleEditTag] = useState(false);        // 编辑单个标签
    const [visibleUpdateTagName, setVisibleUpdateTagName] = useState(false);    // 更新标签名
    const [visibleAddFriendToTag, setVisibleAddFriendToTag] = useState(false);  // 添加好友到该Tag
    const [visibleRemoveFriendFromTag, setVisibleRemoveFriendFromTag] = useState(false); // 从该Tag中移除好友
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
        try {
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
            setVisibleNewTag(false);

        } catch(error) {
            alert(error);
        }
        
        
    };

    // 删除好友标签
    const updateTagList = async() => {
        const {data} = await axios.get(getUrl("/api/friendTag"), {
            headers: {
                Authorization: `${token}`
            },
            params: {
                userName: userName,
            }
        });
        setFriendTagList(data.data);
    }
    const deleteTag = async() => {
        await updateTagList();
        setVisibleDeleteTag(true);
    }
    const handleDeleteTagCancel = () => {
        setFriendTagList([]);
        setSelectedDeleteTag('');
        setVisibleDeleteTag(false);
        
    };
    const handleDeleteTagOk = async() => {
        try {
            const {data} = await axios.post(getUrl("/api/deleteFriendTag"), {
                userName: userName,
                tagName: selectedDeleteTag,
        },{
            headers: {
                'Authorization': `${token}`
            },
        });
        setVisibleDeleteTag(false);
        setFriendTagList([]);
        setSelectedDeleteTag('');
        } catch(error) {
            alert(error);
        }
    };
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
    const addFriendToTag = () => {
        setVisibleAddFriendToTag(true);

    };
    const handleAddFriendToTagCancel = ()=> {
        setVisibleAddFriendToTag(false);
    };
    const handleAddFriendToTagOk = async() => {
        try{
            const {data} = await axios.post(getUrl("/api/friendTag"), {
                userName: userName,
                tagName: selectedTag?.tagName,
                friendList: selectedNewFriendList,
            }, {
                headers: {
                    Authorization: `${token}`
                },
            });
            // 更新selectedTag到tagName
            selectedNewFriendList.forEach((friend:string) => {
                if(!selectedTag?.inTagUserList.includes(friend)) {
                    selectedTag?.inTagUserList.push(friend);
                }
            });
            setVisibleAddFriendToTag(false);
            setSelectedNewFriendList([]);
        } catch(error) {
            alert(error);
        }
    };

    // 移除标签中的好友
    const removeFriendFromTag = () => {
        setVisibleRemoveFriendFromTag(true);
    };
    const handleRemoveFriendFromTagCancel = () => {
        setVisibleRemoveFriendFromTag(false);
    };
    const handleRemoveFriendFromTagOk = async() => {
        try {
            const {data} = await axios.post(getUrl("/api/friendTag/delete"), {
                userName: userName,
                tagName: selectedTag?.tagName,
                friendList: selectedRemoveFriendList,
            }, {
                headers: {
                    Authorization: `${token}`
                },
            });
            // 更新selectedTag到tagName
            selectedRemoveFriendList.forEach((friend:string) => {
                if(selectedTag?.inTagUserList.includes(friend)) {
                    const index = selectedTag?.inTagUserList.indexOf(friend);
                    selectedTag?.inTagUserList.splice(index, 1);
                }
            })
            setVisibleRemoveFriendFromTag(false);
            setSelectedRemoveFriendList([]);
        } catch(error) {
            alert(error);
        };
    };

    
    // 编辑Tag
    const editTag = (item: Tag) => {
        setSelectedTag(item);
        setVisibleEditTag(true);

    };
    const handleEditTagCancel = () => {
        setVisibleEditTag(false);
        setSelectedTag(undefined);
    };
    // 修改Tag名称
    const updateTagName = () => {
        setVisibleUpdateTagName(true);
    };
    const handleUpdateTagNameCancel = () => {
        setVisibleUpdateTagName(false);
        setNewTagName('');
    };
    const handleUpdateTagNameOk =  async() => {
        console.log(newTagName);
        const {data} = await axios.post(getUrl('/api/reviseFriendTag'),{
            userName: userName,
            tagName: selectedTag?.tagName,
            newName: newTagName,
        },{
            headers: {
                'Authorization': `${token}`
            },
        });
        // 更新selectedTag到tagName
        const newSelectedTag:Tag = {
            tag_id: selectedTag?.tag_id ? selectedTag?.tag_id : 0,
            tagName: newTagName,
            inTagUserList: selectedTag?.inTagUserList ? selectedTag?.inTagUserList: [],
        };
        setSelectedTag(newSelectedTag);
        updateTagList();
        setVisibleUpdateTagName(false);
        setNewTagName('');
    };

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
            <Tag />
        </div>
    )
}

export default FriendList;
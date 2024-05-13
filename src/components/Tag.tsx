import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import { useRouter } from 'next/router';
import styles from '../pages/avatar.module.css';
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
    tags: string[];
}
interface Tag {
    tag_id: number;
    tagName: string;
    inTagUserList: string[];
}

const Tag = () => {
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
    useEffect(() => {
        // const fetchData = async() => {
        //     try {
        //         const response = await fetch(getUrl(`/api/friendList/${userName}`), {
        //             method: 'GET',
        //             headers: {
        //                 'Authorization': `${token}`
        //             },
        //         });
        //         const data = await response.json();
        //         if(Number(data.code) === 0) {
        //             setFriendDataList(data.friendDataList);
        //         } else {
        //             switch(Number(data.code)) {
        //                 case 2:
        //                     alert("Invalid or expired JWT");
        //                     break;
        //                 case 3:
        //                     alert("Can not view other's friend list");
        //                     break;
        //                 default:
        //                     alert("Something Wrong!");
        //                     break;
        //             }
        //         } 
        //     } catch(error) {
        //         console.error('Error')
        //     }
        // };
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
            fetchData();
            
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
        updateTagList();
        fetchData();
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
            updateTagList();
            fetchData();
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
            updateTagList();
            fetchData();
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
        setVisibleUpdateTagName(false);
        setNewTagName('');
        updateTagList();
        fetchData();
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
                            <p>Tags: {request.tags.join(', ')}</p>
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
                <Button key="setOwner" type="primary" onClick={viewTag}>查看好友标签</Button>
                <Button key="memberList" type="link" onClick={newTag}>新建好友标签</Button>
                <Button key="setAdmin" type="link" onClick={deleteTag}>删除好友标签</Button>
                
                </div>
                
            </Modal>
            <Modal
                title="编辑好友标签"
                visible={visibleEditTag}
                onCancel={handleEditTagCancel}
                footer = {[]}
            >
                <p><b>{selectedTag?.tagName}</b>: {selectedTag?.inTagUserList.join(', ')}</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Button key="updateTag" type='link' onClick={updateTagName}>修改标签名称</Button>
                    <Button key="removeMember" type="link" onClick={addFriendToTag}>添加好友到该标签</Button>
                    <Button key="withdraw" type="link" onClick={removeFriendFromTag}>移除标签中的好友</Button>
                </div>
            </Modal>

            <Modal
                title="修改标签名称"
                visible={visibleUpdateTagName}
                onCancel={handleUpdateTagNameCancel}
                footer = {[
                    <Button key="updateTag" type='primary' onClick={handleUpdateTagNameOk}>确定</Button>
                ]}
            >
                <Input placeholder='输入新的标签名称' allowClear={true} onChange={(event)=> setNewTagName(event.target.value)} value={newTagName} />
                <p></p>
                
            </Modal>

            <Modal
                title="添加好友到标签"
                visible={visibleAddFriendToTag}
                onCancel={handleAddFriendToTagCancel}
                footer = {[
                    <Button key="ok" type='primary' onClick={handleAddFriendToTagOk}>确认</Button>
                ]}
            >
                <p><b>{selectedTag?.tagName}</b>: {selectedTag?.inTagUserList.join(', ')}</p>
                <p>已选新成员: {selectedNewFriendList.join(', ')}</p>
                <List
                bordered
                dataSource={friendDataList}
                renderItem={(item, index)=>(
                    <List.Item key={index} actions={[
                        <Button key="new" onClick={()=>{
                            if(!selectedNewFriendList.includes(item.userName)) {
                                setSelectedNewFriendList([...selectedNewFriendList, item.userName])
                            }
                        }}>添加</Button>
                    ]}>
                        {item.userName}
                    </List.Item>
                )}
                />

            </Modal>
            <Modal
                title="从标签从移除好友"
                visible={visibleRemoveFriendFromTag}
                onCancel={handleRemoveFriendFromTagCancel}
                footer = {[
                    <Button key="ok" type='primary' onClick={handleRemoveFriendFromTagOk}>确认</Button>
                ]}
            >
                <p><b>{selectedTag?.tagName}</b>: {selectedTag?.inTagUserList.join(', ')}</p>
                <p>已选成员: {selectedRemoveFriendList.join(', ')}</p>
                <List
                bordered
                dataSource={friendDataList}
                renderItem={(item, index) => (
                    <List.Item key={index} actions={[
                        <Button key='remove' onClick={()=>{
                            if(!selectedRemoveFriendList.includes(item.userName)) {
                                setSelectedRemoveFriendList([...selectedRemoveFriendList, item.userName])
                            }
                        }}>选择</Button>
                    ]}>
                        {item.userName}
                    </List.Item>
                )}
                />

            </Modal>

            <Modal
                title="新建好友标签"
                visible={visibleNewTag}
                onCancel={handleNewTagCancel}
                footer = {[]}
            >
                <Input placeholder='输入标签名' onChange={(event)=>setTagName(event.target.value)} value={tagName}></Input>
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
                    <List.Item key={item.tag_id} actions={[
                        <Button key='edit' onClick={()=>editTag(item)}>编辑</Button>
                    ]}>
                       <b>{item.tagName}</b>: {item.inTagUserList.join(', ')}
                    </List.Item>
                )}
                />
            </Modal>

            <Modal
                title="删除好友标签"
                visible={visibleDeleteTag}
                onCancel={handleDeleteTagCancel}
                footer = {[
                    <Button key="back" onClick={handleDeleteTagCancel}>取消</Button>,
                    <Button key="ok" type="primary" onClick={handleDeleteTagOk}>确认</Button>
                ]}
            >
                <p>选择删除标签: {selectedDeleteTag}</p>
                <List
                bordered
                dataSource={friendTagList}
                renderItem={(item, index)=>(
                    <List.Item key={item.tag_id} actions={[
                        <Button key='set' type='dashed' onClick={()=>setSelectedDeleteTag(item.tagName)}>选择</Button>
                    ]}>
                       <b>{item.tagName}</b>: {item.inTagUserList.join(', ')}
                    </List.Item>
                )}
                />
            </Modal>    
        </div>
    )
    
}
export default Tag;
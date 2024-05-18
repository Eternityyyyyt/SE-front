import React, { useState, useEffect, useCallback} from 'react';
import { Message, Conversation } from '../api/types';
import { db } from '../api/db';
import styles from './HomePage.module.css';
import { addConversation,useMessageListener,readMessage } from '../api/chat';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import ConversationSelection from './ConversationSelection';
import Chatbox from './ChatBox';
import {  useRequest } from 'ahooks';
import { Modal, List ,Button, message, Menu, Dropdown } from 'antd';
import { PlusCircleOutlined,  DownOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { setActiveChat } from '@/redux/activeChat';
import { getUrl } from '@/api/utils';
import { useRouter } from 'next/router';
interface FriendDataList {
  userName: string;
  nickName: string;
  avatar: string;
}

const HomePage = () => {
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    const router = useRouter();
    // 获取当前用户有的chat_id
    const [memberName, setMemberName] = useState('');
    //const [chat, setChat] = useState<Conversation>();
    const [activeChatId, setActiveChatId] = useState(0)
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
    const { data: conversations, refresh } = useRequest(async () => {
      const convs = await db.conversations.toArray();
      // if (convs.some(conv => !conv.memberList)) {
      //   alert("Some conversations are missing member list, please refresh the page");
      // }
      return convs.filter((conv) => conv.memberList && conv.memberList.includes(userName!));
    }); // 当前用户的会话列表
    const dispatch = useDispatch();
    const update = useCallback(async () => {
      // 更新函数，从后端拉取消息，合并到本地数据库
      await db.pullMessages(userName!,token).then(() => {
        refresh();
        setLastUpdateTime(Date.now());
      });
      //已读消息
      //console.log(db.activeConversationId);
      if(db.activeConversationId){readMessage(userName!,db.activeConversationId,Date.now()+3000,token)}
    }, [userName, refresh]);


    // useEffect(() => {
    //   update();
    //   const intervalId = setInterval(update, 3000);

    // // 组件卸载时清除定时器
    //   return () => clearInterval(intervalId);
    // }, [update]);
    const activeChat = activeChatId ?
     conversations?.find((item) => item.chat_id === activeChatId): undefined;

     
    useEffect(() => {
      db.activeConversationId = activeChatId;
      if(activeChat){
        db.clearUnreadCount(activeChat).then(refresh);
      }

    },[activeChatId, refresh])
    
    useMessageListener(update, userName!); // 使用消息监听器钩子，当有新消息时调用更新函数

    const [friendDataList, setFriendDataList] = useState<FriendDataList[]>([]);
    const [friendList, setFriendList] = useState<string[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([userName]); // 初始化为创建者
    const [visible, setVisible] = useState(false);    // modal的显示状态

    const handleDropDownClick = () => {
      fetch(getUrl(`/api/friendList/${userName}`), {
        method: 'GET',
        headers: {
          'Authorization': `${token}`
        },
      })
      .then(data => data.json())
      .then(data => {
        if(Number(data.code) === 0){
          setFriendDataList(data.friendDataList);
          setFriendList(friendDataList.map(item => item.userName)); // 后续删除friendList，直接使用friendDataList
          console.log(friendDataList);
        }else{
          message.error(data.msg);
        }
      });
      setSelectedMembers([userName]);
    }
    // 第一次加载该页面就获取好友列表一次
    useEffect(() => {
      handleDropDownClick();
    }, []);
    const createGroup = () => {
      setVisible(true);
    };
    const addMembers = (memberName:string) => {
      if(selectedMembers.includes(memberName)){
        return;
      } else {
        setSelectedMembers(currentMembers => [...currentMembers, memberName]);
      }
      
    };
    const removeMembers = (memberName:string) => {
      setSelectedMembers(currentMembers => currentMembers.filter(item => item !== memberName));
    }
    const handleCancel = () => {
      setVisible(false);
    };
    const handleOk = async() => {
      const newChat = await addConversation({isGroup: true, memberList: selectedMembers}, token);
      if(newChat){
        // 在数据库中创建该群聊信息
        db.conversations.add({
          chat_id: newChat.chat_id,
          memberList: selectedMembers,
          isGroup: true,
          owner: userName,
        })
        const chatId = newChat.chat_id;
        await db.pullConversations(userName, [chatId], token);
        dispatch(setActiveChat(chatId));
        setVisible(false);
        refresh();

      }
    }
    const menu = (
      <Menu>
        <Menu.Item>
          <Button type="dashed" key={"create"}  onClick={createGroup}>发起群聊</Button>
        </Menu.Item>
      </Menu>

    );

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.settings}> 
          
          <div className={styles.conversations}>
            <Dropdown overlay = {menu} trigger={['click']}>
              <Button icon = {<PlusCircleOutlined />} onClick={handleDropDownClick}>
                {/* <DownOutlined /> */}
              </Button>
            </Dropdown>
            <Modal
              title="创建群聊"
              visible={visible}
              onCancel={handleCancel}
              footer={[
                <Button key="cancel" onClick={handleCancel}>取消</Button>,
                <Button key="create" type="primary" onClick={handleOk}>创建群聊</Button>
              ]}
              >
                <div>
                  {/* <List bordered dataSource={selectedMembers} renderItem={item => <List.Item>{item}</List.Item>} /> */}
                  <p>已选择的群组成员：{selectedMembers.join(',')}</p>
                </div>
                <List
                  bordered
                  dataSource={friendList}
                  renderItem={(member, index) => (
                    <List.Item key={index} actions={[
                      <Button key={"add"} type='dashed' onClick={() => addMembers(member)}><CheckOutlined /></Button>,
                      <Button key={"remove"} type='dashed' onClick={() => removeMembers(member)}><CloseOutlined /></Button>
                    ]}
                    >{member}
                    </List.Item>
                  )}
                  />
              </Modal>
              

            <ConversationSelection // 会话选择组件
              me={userName}
              conversations={conversations || []}
              onSelect={(id) => {setActiveChatId(id);readMessage(userName,id,Date.now(),token)}}
            />
          </div>
        </div>
          <Chatbox me={userName} conversation={activeChat} lastUpdateTime={lastUpdateTime} memberName={memberName}/>
      </div>
      {/* <Button onClick={update}>更新数据</Button> */}
    </div>
    

    
  );
};

export default HomePage;

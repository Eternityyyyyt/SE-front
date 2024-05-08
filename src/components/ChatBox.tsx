import React, { useRef, useState ,useEffect} from 'react';
import { Input, Button, Divider, message, Menu, Dropdown, Modal, List } from 'antd';
import { useRequest } from 'ahooks';
import styles from './ChatBox.module.css';
import MessageBubble from './MessageBubble';
import { Conversation, Message } from '../api/types';
import { addMessage } from '../api/chat';
import { getConversationDisplayName ,getConversationDisplaymemberList} from '../api/utils';
import { db } from '../api/db';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import {getUserAvatar} from  '../api/utils'
import { PlusCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getUrl } from '../api/utils';
import { icons } from 'antd/es/image/PreviewGroup';
export type ChatboxProps = {
  me: string; // 当前用户
  conversation?: Conversation; // 当前选中的会话 (可能为空)
  lastUpdateTime?: number; // 本地消息数据最后更新时间，用于触发该组件数据更新
  memberName: string;
};

// 聊天框组件
const Chatbox: React.FC<ChatboxProps> = ({
  me,
  conversation,
  lastUpdateTime,
  memberName,
}) => {
  const cachedMessagesRef = useRef<Message[]>([]); // 使用ref存储组件内缓存的消息列表
  const [sending, setSending] = useState(false); // 控制发送按钮的状态
  const [inputValue, setInputValue] = useState(''); // 控制输入框的值
  const messageEndRef = useRef<HTMLDivElement>(null); // 指向消息列表末尾的引用，用于自动滚动
  const token = useSelector((state:RootState) => state.auth.token);
  const userName = useSelector((state:RootState) => state.auth.name);
  const chat_id = conversation?.chat_id;
  const replying = 0; // 先不引用
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars:Record<string, string>= {};
      if(conversation){
        for (const member of conversation.memberList) {
            newAvatars[member] = await getUserAvatar(member, me);
        }
      }
      setAvatars(newAvatars);
    };
    fetchAvatars();
  }, [conversation?.chat_id]);

  // 使用ahooks的useRequest钩子从IndexedDB异步获取消息数据，依赖项为lastUpdateTime
  const { data: messages } = useRequest(
    async () => {
      if (!conversation) return [];
      const curMessages = cachedMessagesRef.current;
      const newMessages = await db.getCachedMessages(conversation); // 从本地数据库获取当前会话的所有消息
      //console.log(newMessages);
      cachedMessagesRef.current = newMessages;
      // 设置定时器以确保滚动操作在数据更新后执行
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({
          behavior: curMessages.length > 0 ? 'smooth' : 'instant', // 根据消息数量选择滚动方式 (平滑滚动 / 瞬间跳转)
        });
      }, 10);
      return cachedMessagesRef.current; // 返回更新后的消息列表
    },
    { refreshDeps: [conversation, lastUpdateTime] }
  );

  // 发送消息的函数
  const sendMessage = () => {
    if (!inputValue) {
      message.error('消息内容不能为空');
      return;
    }
    const content = inputValue.trim();
    setSending(true);
    if(!chat_id) return; // 如果chat_id为空，return
    addMessage({userName, chat_id, content, replying},token) // 调用API发送消息
      .then(() => setInputValue(''))
      .catch(() => message.error('消息发送失败'))
      .finally(() => setSending(false));
  };
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // 选中的管理员列表
  const [memberList, setMemberList] = useState<string[]>([]); // 群成员列表
  const [isGroup, setIsGroup] = useState(false);
  const [groupOwner, setGroupOwner] = useState(''); // 群主
  const [visibleGroup, setVisibleGroup] = useState(false);  // 群聊settings Modal
  const [visiblePrivate, setVisiblePrivate] = useState(false); // 私聊settings Modal
  const [visibleAdmin, setVisibleAdmin] = useState(false); // 管理员Modal
  const [visibleOwner, setVisibleOwner] = useState(false); // 群主Modal
  const settings = () => {
    if(conversation) {
      setIsGroup(conversation.isGroup);
      // 加载群成员列表
      setMemberList(conversation.memberList);
      // 清空群管理员选择列表
      setSelectedMembers([]);
      // 加载群主信息
      if(conversation.owner) {
        setGroupOwner(conversation.owner);
      }
    }
  };
  const control = () => {
    if(isGroup === true) {
      setVisibleGroup(true);
      setVisiblePrivate(false);
    }
    else {
      setVisiblePrivate(true);
      setVisibleGroup(false);
    }
  };
  const admin = () => {
    if(groupOwner !== userName) {
      alert("You are not the owner of this group");
      return;
    } else {
      setVisibleAdmin(true);
    }
    
  };
  const owner = () => {
    if(groupOwner !== userName) {
      alert("You are not the owner of this group");
      return;
    } else {
      setVisibleOwner(true);
    }
    
  };
  const handleCancel = () => {
    setVisibleGroup(false);
    setVisiblePrivate(false);
  }
  const handleAdminCancel = () => {
    setVisibleAdmin(false);
    setSelectedMembers([]);
  }
  const handleOwnerCancel = () => {
    setGroupOwner('');
    setVisibleOwner(false);
  }
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
  const setOwner = (member:string) => {
    setGroupOwner(member);
  }
  const handleAdminOk = async() => {
    if(selectedMembers.length === 0) {
      return;
    }
    const {data} = await axios.post(getUrl('/api/chat/setAdmin'), {
        ownerName: userName,
        chat_id: chat_id,
        adminList: selectedMembers
    }, {
        headers: {
            'Authorization': `${token}`
        }
    });
    if(data.code === 0) {
      setVisibleAdmin(false);
      setSelectedMembers([]);
      if(conversation?.adminList) {
        conversation.adminList = selectedMembers;
      }
    } else {
      alert("Somethng wrong");
      setVisibleAdmin(false);
    }
  }
  const handleOwnerOk = async() => {
    if(!groupOwner) {
      return;
    }
    const {data} = await axios.post(getUrl('/api/chat/changeOwner'), {
      ownerName: conversation?.owner,
      chat_id: chat_id,
      newOwnerName: groupOwner
    }, {
      headers: {
          'Authorization': `${token}`
      }
    });
    if(data.code === 0) {
      if(conversation?.owner) {
        conversation.owner = groupOwner;
      }
      setVisibleOwner(false);
      setGroupOwner('');
    } else {
      alert("Somethng wrong");
      setVisibleOwner(false);
    }
    
  };
  const menu = (
    <Menu>
      <Menu.Item>
        <Button type="dashed" key={"control"}  onClick={control}>管理</Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.container}>
      {conversation && (
        <>
          <div className={styles.title}>
            {getConversationDisplayName(conversation,userName)}
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type='dashed' shape='circle' key={"settings"}  onClick={settings} className={styles.settings}>. . .</Button>
            </Dropdown>
          </div>
          <Divider className={styles.divider} />
        </>
      )}

      <Modal
        title="设置"
        visible={visibleGroup}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>取消</Button>,
        ]}
        >
          <Button key="setAdmin" type="primary" onClick={admin}>设置管理员</Button>
          <Button key="setOwner" type="primary" onClick={owner}>设置群主</Button>
        </Modal>


      <Modal
        title="设置群管理员"
        visible={visibleAdmin}
        onCancel={handleAdminCancel}
        footer={[
          <Button key="cancel" onClick={handleAdminCancel}>取消</Button>,
          <Button key="create" type="primary" onClick={handleAdminOk}>确定</Button>
        ]}
        >
          <div>
            <p>当前群管理员：{conversation?.adminList ? conversation.adminList.join(', ') : 'None'}</p>
            <p>请选择要设置为群管理员的成员：{selectedMembers.join(', ')}</p>
          </div>
          <List
            bordered
            dataSource={memberList.filter(item => item !== userName)}
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

        <Modal
          title="设置群主"
          visible={visibleOwner}
          onCancel={handleOwnerCancel}
          footer={[
            <Button key="cancel" onClick={handleOwnerCancel}>取消</Button>,
            <Button key="create" type="primary" onClick={handleOwnerOk}>确定</Button>
          ]}
          >
            <p>当前群主为：{conversation?.owner}</p>
            <p>请选择新的群主</p>
            <List
              bordered
              dataSource={memberList.filter(item => item !== userName)}
              renderItem={(member, index) => (
                <List.Item key={index} actions={[
                  <Button key={("setOwner")} type='dashed' onClick={() => setOwner(member)}><CheckOutlined /></Button>
                ]}
                >{member}
                </List.Item>
                )}
                />
          </Modal>

        {/* 私聊相关Modal TODO */}


      


      <div className={styles.messages}>
        {/* 消息列表容器 */}
        {messages?.map((item) => (
          <MessageBubble key={item.message_id} isMe={item.sender == me} timestamp={item.created_time} avatarPath={`..${avatars[item.sender]}`} {...item} /> // 渲染每条消息为MessageBubble组件
        ))}
        <div ref={messageEndRef} /> {/* 用于自动滚动到消息列表底部的空div */}
      </div>
      {conversation && (
        <>
          <Input.TextArea
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey && !e.ctrlKey) {
                e.preventDefault(); // 阻止默认事件
                e.stopPropagation(); // 阻止事件冒泡
                sendMessage();
              }
            }}
            rows={3}
            autoSize={false} // 关闭自动调整大小
            readOnly={sending} // 当正在发送消息时，设置输入框为只读
          />
          <Button
            className={styles.submitButton}
            type="primary"
            disabled={sending} // 当正在发送消息时，禁用按钮
            loading={sending} // 显示加载中状态
            onClick={sendMessage} // 点击时调用发送消息函数
          >
            发送 (Enter)
          </Button>
        </>
      )}
    </div>
  );
};

export default Chatbox;

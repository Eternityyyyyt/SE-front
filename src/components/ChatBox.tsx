import React, { useRef, useState ,useEffect} from 'react';
import { Input, Button, Divider, message, Menu, Dropdown, Modal, List, Avatar } from 'antd';
import { useRequest } from 'ahooks';
import styles from './ChatBox.module.css';
import MessageBubble from './MessageBubble';
import { Conversation, Message } from '../api/types';
import { addMessage } from '../api/chat';
import { getConversationDisplayName } from '../api/utils';
import { db } from '../api/db';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import {getUserAvatar} from  '../api/utils'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getUrl } from '../api/utils';

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


  /*********************************************************/
  /* Group */
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);   // 选中的管理员列表
  const [memberList, setMemberList] = useState<string[]>([]);             // 群成员列表
  const [removeMember, setRemoveMember] = useState('');                   // 移除的成员，一次只能删除一个
  const [isGroup, setIsGroup] = useState(false);
  const [groupOwner, setGroupOwner] = useState(conversation?.owner);      // 群主
  const [groupOwnerTmp, setGroupOwnerTmp] = useState('');                 // 群主临时变量，用于转让群主页面的显示
  const [visibleGroup, setVisibleGroup] = useState(false);                // 群聊settings Modal
  const [visiblePrivate, setVisiblePrivate] = useState(false);            // 私聊settings Modal
  const [visibleAdmin, setVisibleAdmin] = useState(false);                // 管理员Modal
  const [visibleOwner, setVisibleOwner] = useState(false);                // 群主Modal
  const [visibleRemoveMember, setVisibleRemoveMember] = useState(false);  // 移除成员Modal
  const [visibleDisplayMembers, setVisibleDisplayMembers] = useState(false);  // 显示群成员Modal
  const [visibleWithdraw, setVisibleWithdraw] = useState(false);           // 退出群聊确认Modal
  // 三个点
  useEffect(() => {
    settings();
  },[conversation])
  const settings = () => {
    if(conversation) {
      setIsGroup(conversation.isGroup);
      // 加载群成员列表
      setMemberList(conversation.memberList);
      // 清空群管理员选择列表
      setSelectedMembers([]);
      // 加载群主信息
      setGroupOwner(conversation.owner);
    }
    else {
      console.log("No Selected Conversation");
    }
  };
  // 管理：群为群管理，私聊为好友管理
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
      console.log(groupOwner);
      return;
    } else {
      setVisibleAdmin(true);
      console.log(conversation?.adminList);
    }
    
  };
  const owner = () => {
    if(groupOwner !== userName) {
      alert("You are not the owner of this group");
      console.log(groupOwner);
      return;
    } else {
      setVisibleOwner(true);
      console.log(groupOwner);
    }
    
  };
  const displayMemberList = () => {
    setVisibleDisplayMembers(true);
  };
  const removeMemberInit = () => {
    // 需要是群主或群管理员才能移除成员
    if(conversation?.adminList) {
      if(!conversation.adminList.includes(userName) && conversation.owner !== userName) {
        alert("You are not the owner or admin of this group");
        return;
      }
    }
    else if(conversation?.owner !== userName) {
      alert("You are not the owner or admin of this group");
      console.log(groupOwner);

      return;
    }
    setVisibleRemoveMember(true);
    
  };
  const withdraw = () => {
    // 判断是否在群中，防止二次退群
    if(!conversation?.memberList.includes(userName)) {
      alert("You are not in this group");
      setVisibleGroup(false);
      return;
    }
    if(conversation?.owner === userName) {
      alert("You are the owner of this group, change the owner first");
      return;
    } else {
      setVisibleWithdraw(true);
    }
  };
  /* 取消键函数 */
  // handleSettingCancel
  const handleCancel = () => {
    setVisibleGroup(false);
    setVisiblePrivate(false);
  };
  const handleAdminCancel = () => {
    setVisibleAdmin(false);
    setSelectedMembers([]);
  };
  const handleOwnerCancel = () => {
    setGroupOwner(conversation?.owner);
    setGroupOwnerTmp('');
    setVisibleOwner(false);
  };
  const handleRemoveMemberCancel = () => {
    setRemoveMember('');
    setVisibleRemoveMember(false);
  };
  const handleDisplayCancel = () => {
    setVisibleDisplayMembers(false);
  };
  const handleWithdrawCancel = () => {
    setVisibleWithdraw(false);
  }
  /* 添加键函数 */
  const addAdminMembers = (memberName:string) => {
    if(selectedMembers.includes(memberName)){
      return;
    } else {
      setSelectedMembers(currentMembers => [...currentMembers, memberName]);
    }
  };
  const setRemoveMembers = (memberName:string) => {
    setRemoveMember(memberName);
  };
  const removeAdminMembers = (memberName:string) => {
    setSelectedMembers(currentMembers => currentMembers.filter(item => item !== memberName));
  };
  const setOwnerTmp = (member:string) => {
    setGroupOwnerTmp(member);
  };
  /* 确认键函数 */
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
      if(conversation) {
        conversation.adminList = selectedMembers;
        db.conversations.update(conversation.chat_id, { adminList: selectedMembers });
      }
      setSelectedMembers([]);
    } else {
      alert("Somethng wrong");
      setVisibleAdmin(false);
    }
  }
  const handleOwnerOk = async() => {
    if(!groupOwnerTmp) {
      return;
    }
    setGroupOwner(groupOwnerTmp);     // 确认改为当前选中者
    const {data} = await axios.post(getUrl('/api/chat/changeOwner'), {
      ownerName: conversation?.owner,
      chat_id: chat_id,
      newOwnerName: groupOwnerTmp
    }, {
      headers: {
          'Authorization': `${token}`
      }
    });
    if(data.code === 0) {
      if(conversation) {
        console.log(groupOwnerTmp);
        await db.conversations.update(conversation.chat_id, { owner: groupOwnerTmp });
        conversation.owner = groupOwnerTmp;
        setGroupOwner(groupOwnerTmp);
      }
      setVisibleOwner(false);
      setGroupOwnerTmp('');
    } else {
      alert("Somethng wrong");
      setVisibleOwner(false);
    }
    
  };
  const handleRemoveMemberOk = async() => {
    if(conversation?.adminList) {
      if(userName !== groupOwner && !conversation?.adminList.includes(removeMember)) {
        alert("Admin can not remove admin");
        return;
      }
    }
    const {data} = await axios.post(getUrl('/api/chat/removeMember'), {
      userName: userName,
      chat_id: chat_id,
      memberName: removeMember
    }, {
      headers: {
          'Authorization': `${token}`
      }
    });
    if(data.code === 0) {
      setVisibleRemoveMember(false);
      setRemoveMember('');
      // update
      if(conversation?.memberList) {
        const newMemberList = conversation.memberList.filter(item => item !== removeMember);
        // 更新管理员列表
        if(conversation.adminList) {
          const newAdminList = conversation.adminList.filter(item => item !== removeMember);
          await db.conversations.update(conversation.chat_id, { adminList: newAdminList });
          setSelectedMembers(newAdminList);
        }
        conversation.memberList = newMemberList;
        // 更新成员列表
        await db.conversations.update(conversation.chat_id, { memberList: newMemberList });
        setMemberList(conversation.memberList);
      }
    } else {
      alert("Somethng wrong");
      setVisibleRemoveMember(false);
      setRemoveMember('');
    }
  };
  const handleWithdrawOk = async() => {
    const {data} = await axios.post(getUrl('/api/chat/leaveGroup'), {
      userName: userName,
      chat_id: chat_id
      
    },{
      headers: {
          'Authorization': `${token}`
      }
    });
    if(data.code === 0) {
      // update
      if(conversation?.memberList) {
        conversation.memberList = conversation.memberList.filter(item => item !== userName);
        console.log(conversation.memberList);
        // 在数据库中更新
        await db.conversations.update(conversation.chat_id, { memberList: conversation.memberList });
        setMemberList(conversation.memberList);
      }
    } else {
      alert("Somethng wrong");
    }
    setVisibleWithdraw(false);
    setVisibleGroup(false);
  };
  const getMemberIdentity = (member:string) => {
    if(conversation?.owner === member){return "（群主）"}
    if(conversation?.adminList?.includes(member)){return "（管理员）"}
    return ''
  }
  const memberListSortFunc = (a:string,b:string) => {
    if (a === conversation?.owner) return -1;
    if (b === conversation?.owner) return 1;

    // 管理员排在群主之后
    if (memberList.includes(a) && !memberList.includes(b)) return -1;
    if (memberList.includes(b) && !memberList.includes(b)) return 1;

    return a < b ? -1 : 1;
  }
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button key="memberList" type="link" onClick={displayMemberList}>群成员列表</Button>
          <Button key="setAdmin" type="link" onClick={admin}>设置管理员</Button>
          <Button key="setOwner" type="link" onClick={owner}>设置群主</Button>
          <Button key="removeMember" type="link" onClick={removeMemberInit}>移除成员</Button>
          <Button key="withdraw" type="dashed" onClick={withdraw}>退出群聊</Button>
          </div>
          
          
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
                <Button key={"add"} type='dashed' onClick={() => addAdminMembers(member)}><CheckOutlined /></Button>,
                <Button key={"remove"} type='dashed' onClick={() => removeAdminMembers(member)}><CloseOutlined /></Button>
            ]}
            >{member}
            </List.Item>
            )}
            />
        </Modal>

        <Modal
        title="群成员信息"
        visible={visibleDisplayMembers}
        onCancel={handleDisplayCancel}
        footer={[
          <Button key="cancel" onClick={handleDisplayCancel}>关闭</Button>,
          
        ]}
        >
          <List
            bordered
            dataSource={memberList.slice(0).sort(memberListSortFunc)}
            renderItem={(member, index) => (
            <List.Item key={index} actions={[
                // 添加好友等操作TODO
            ]}
            >{<Avatar src={`..${avatars[member]}`}></Avatar>} {member}{getMemberIdentity(member)}
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
            <p>请选择新的群主：{groupOwnerTmp}</p>
            <List
              bordered
              dataSource={memberList.filter(item => item !== userName)}
              renderItem={(member, index) => (
                <List.Item key={index} actions={[
                  <Button key={("setOwner")} type='dashed' onClick={() => setOwnerTmp(member)}><CheckOutlined /></Button>
                ]}
                >{member}
                </List.Item>
                )}
                />
          </Modal>


          <Modal
            title="移除成员"
            visible={visibleRemoveMember}
            onCancel={handleRemoveMemberCancel}
            footer={[
              <Button key="cancel" onClick={handleRemoveMemberCancel}>取消</Button>,
              <Button key="create" type="primary" onClick={handleRemoveMemberOk}>确定</Button>
            ]}
            >
              <p>请选择要移除的成员：{removeMember}</p>
              <List
                bordered
                dataSource={memberList.filter(item => item !== userName)}
                renderItem={(member, index) => (
                  <List.Item key={index} actions={[
                    <Button key={"add"} type='dashed' onClick={() => setRemoveMembers(member)}><CheckOutlined /></Button>,

                  ]}
                  >{member}
                  </List.Item>
                  )}
                  />
            </Modal>



          <Modal
            title="退出群聊"
            visible={visibleWithdraw}
            onCancel={handleWithdrawCancel}
            footer={[
              <Button key="cancel" onClick={handleWithdrawCancel}>取消</Button>,
              <Button key="create" type="primary" onClick={handleWithdrawOk}>确定</Button>
            ]}
            >
              <h2>确定退出群聊？</h2>
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

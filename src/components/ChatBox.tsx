import React, { useRef, useState ,useEffect} from 'react';
import { Input, Button, Divider, message, Menu, Dropdown, Modal, List, Avatar  } from 'antd';
import { MessageOutlined, TeamOutlined ,PlusCircleOutlined ,CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useRequest  } from 'ahooks';
import { useRouter } from "next/router";
import styles from './ChatBox.module.css';
import MessageBubble from './MessageBubble';
import { Conversation, Message ,GroupInvitation} from '../api/types';
import { addMessage } from '../api/chat';
import { getConversationDisplayName ,getUserAvatar ,getUrl , formattime} from '../api/utils';
import { db } from '../api/db';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFriendName,setFriendNickname, setFriendAvatar } from '@/redux/friend';

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
  const [sendingRequest,setSendingRequest] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 控制输入框的值
  const messageEndRef = useRef<HTMLDivElement>(null); // 指向消息列表末尾的引用，用于自动滚动
  const messageRefs = useRef(new Map())
  const token = useSelector((state:RootState) => state.auth.token);
  const userName = useSelector((state:RootState) => state.auth.name);
  const [currConversation, setCurrConversation] = useState<Conversation | undefined>(conversation);//conversation无法被直接更新，借用新state来更新
  const chat_id = conversation?.chat_id;
  const [replying,setReplying] = useState(0); // 引用的message_id
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [friendAvatars, setFriendAvatars] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchAvatars = async () => {
      const newAvatars:Record<string, string>= {};
      if(currConversation){
        for (const member of currConversation?.memberList) {
          if (!(member in avatars)) {newAvatars[member] = await getUserAvatar(member, me);}
          else{newAvatars[member] = avatars[member]}
        }
      }
      setAvatars(newAvatars);
    };
    fetchAvatars();
  }, [currConversation?.memberList]);

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
      .finally(() =>{ 
        setSending(false);
        db.messages.where('message_id').equals(replying).modify((message) =>{
          message.repliedCount++;
        });
        setReplying(0);
      });
  };

  // const messageRefs = messages?.reduce((acc:any, msg) => {
  //   acc[msg.message_id] = useRef<HTMLDivElement>(null);
  //   return acc;
  // }, {});
  const scrollToMessage = (messageId:number) => {
    const ref = messageRefs.current.get(messageId);

      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth' ,block: 'end',});
      }
  };

  /*********************************************************/
  /* Group */
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);   // 选中的管理员列表
  //const [memberList, setMemberList] = useState<string[]>([]);             // 群成员列表
  const [removeMember, setRemoveMember] = useState('');                   // 移除的成员，一次只能删除一个
  //const [isGroup, setIsGroup] = useState(false);
  //const [groupOwner, setGroupOwner] = useState(conversation?.owner);      // 群主
  const [groupOwnerTmp, setGroupOwnerTmp] = useState('');                 // 群主临时变量，用于转让群主页面的显示
  const [visibleGroup, setVisibleGroup] = useState(false);                // 群聊settings Modal
  const [visiblePrivate, setVisiblePrivate] = useState(false);            // 私聊settings Modal
  const [visibleAdmin, setVisibleAdmin] = useState(false);                // 管理员Modal
  const [visibleOwner, setVisibleOwner] = useState(false);                // 群主Modal
  const [visibleRemoveMember, setVisibleRemoveMember] = useState(false);  // 移除成员Modal
  const [visibleDisplayMembers, setVisibleDisplayMembers] = useState(false);  // 显示群成员Modal
  const [visibleWithdraw, setVisibleWithdraw] = useState(false);           // 退出群聊确认Modal
  const [visibleAddFriend, setVisibleAddFriend] = useState(false);           // 添加好友填写信息Modal
  const [visibleInviteFriend, setVisibleInviteFriend] = useState(false); //邀请好友modal
  const [visibleGroupInvitationList, setVisibleGroupInvitationList] = useState(false);           // 添加好友填写信息Modal
  const [friendList , setFriendList] = useState<string[]>([])
  const [requestMessage , setRequestMessage] = useState('');
  const [memberToAddFriend,setMemberToAddFriend] = useState('');
  const [groupInvitationList,setGroupInvitaionList] = useState<GroupInvitation[]>([])
  const dispatch = useDispatch();
  const router = useRouter()

 
  useEffect(() => {
    setCurrConversation(conversation)
    settings();
  },[conversation])
  useEffect(() =>{
    const fetchFriendAvatars = async () => {
      const newAvatars:Record<string, string>= {};
      if(friendList){
        for (const friend of friendList) {
          if (!(friend in avatars))
            newAvatars[friend] = await getUserAvatar(friend, me);
        }
      }
      setFriendAvatars(newAvatars);
    };
    if(visibleDisplayMembers){fetchFriendAvatars();}
  },[visibleDisplayMembers])
  const fetchGroupInvitationList = async () => {
    const {data} = await axios.get(getUrl('/api/chat/groupInvitation'), {
    headers: {
      Authorization: `${token}`
    },
    params: {
      userName: userName,   
      chat_id: chat_id,     
    },
    });
    if(data.code === 0) {
      setGroupInvitaionList( data.data.map((obj:any) =>{
        return {
          invitation_id: obj.invitation_id,
          chat_id: chat_id,
          invitor: obj.invitorName,
          invitee: obj.inviteeName,
          created_time: obj.created_time,
          status: obj.status,
        } as GroupInvitation
        }
      ))
    } else {
      alert(data.info);
    }
  };
  useEffect(() =>{
    if(visibleGroup){
      if(currConversation?.adminList?.includes(userName) || currConversation?.owner == userName){
        fetchGroupInvitationList();
      }
    }
  },[visibleGroup])

  const settings = () => {
    setReplying(0)
    if(conversation) {
      setSelectedMembers([]);
    }
    else {
      console.log("No Selected Conversation");
    }
  };
  // 管理：群为群管理，私聊为好友管理
  const control = async () => {
    await db.updateConversation(me,chat_id!,token).then(conv => {if(conv){setCurrConversation((oldconv) => conv)}});
    if(currConversation?.isGroup === true) {
      setVisibleGroup(true);
      setVisiblePrivate(false);
    }
    else {
      setVisiblePrivate(true);
      setVisibleGroup(false);
    }
  };
  const admin = async () => {
    let currOwner = currConversation?.owner;
    let currAdminList = currConversation?.adminList;
    await db.updateConversation(me,chat_id!,token).then(
      conv => { 
        if(conv){
          currOwner = conv.owner;
          currAdminList = conv.adminList; 
          setCurrConversation((oldconv) => conv)
        }
      }
    );
    if(currOwner !== userName) {
      alert("You are not the owner of this group");
      console.log(currOwner);
      return;
    } else {
      setVisibleAdmin(true);
      console.log(currAdminList);
    }
    
  };
  const owner = async () => {
    let currOwner = currConversation?.owner;
    await db.updateConversation(me,chat_id!,token).then(conv => {if(conv){currOwner = conv.owner; setCurrConversation((oldconv) => conv)}});
    //需要currOwner的原因：setcurrconversation执行后curr conversation不会立刻更新
    if(currOwner !== userName) {
      alert("You are not the owner of this group");
      console.log(currConversation);
      return;
    } else {
      setVisibleOwner(true);
      console.log(currConversation?.owner);
    }
    
  };
  const displayMemberList = async () => {
    await db.updateConversation(me,chat_id!,token).then(conv => {if(conv){ setCurrConversation((oldconv) => conv)}});
    try {
      const response = await fetch(getUrl(`/api/friendList/${userName}`), {
          method: 'GET',
          headers: {
              'Authorization': `${token}`
          },
      });
      const data = await response.json();
      if(Number(data.code) === 0) {
        setFriendList(data.friendDataList.map((obj:any) => obj.userName))
        //setFriendList(data.friendDataList);
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
  
    //console.log(chat_id)
    setVisibleDisplayMembers(true);
  };
  const removeMemberInit = async () => {
    let currOwner = currConversation?.owner;
    let currAdminList = currConversation?.adminList;
    await db.updateConversation(me,chat_id!,token).then(conv => { if(conv){currOwner = conv.owner;currAdminList = conv.adminList; setCurrConversation((oldconv) => conv)}});
    // 需要是群主或群管理员才能移除成员
    if(currAdminList) {
      if(!currAdminList.includes(userName) && currOwner !== userName) {
        alert("You are not the owner or admin of this group");
        return;
      }
    }
    else if(currOwner !== userName) {
      alert("You are not the owner or admin of this group");
      console.log(currOwner);

      return;
    }
    setVisibleRemoveMember(true);
    
  };
  const withdraw = async () => {
    // 判断是否在群中，防止二次退群
    await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
    if(!currConversation?.memberList.includes(userName)) {
      alert("You are not in this group");
      setVisibleGroup(false);
      return;
    }
    if(currConversation?.owner === userName) {
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
    //setGroupOwner(conversation?.owner);
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
  const handleAddFriendCancel = () => {
    setRequestMessage('')
    setVisibleAddFriend(false);
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
  const inviteFriend = async (friend:string) => {
    const {data} = await axios.post(getUrl('/api/chat/invite'), {
      userName: userName,
      chat_id: chat_id,
      inviteeList: [friend]
    }, {
      headers: {
          'Authorization': `${token}`
      }
    });
    if(data.code === 0) {
      if(conversation) {
        await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
      }
      if (currConversation?.adminList?.includes(userName) || currConversation?.owner == userName){
        alert(`Successfully invite ${friend} to chat`)
      }
      else{
        alert(`Successfully invite ${friend} to chat, please wait for the owner or admin to accept.`)
      }
      setVisibleInviteFriend(false);
    } else {
      alert("Something wrong");
      setVisibleInviteFriend(false);
    }
  }
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
        //conversation.adminList = selectedMembers;
        //db.conversations.update(conversation.chat_id, { adminList: selectedMembers });
        await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
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
    //setGroupOwner(groupOwnerTmp);     // 确认改为当前选中者
    const {data} = await axios.post(getUrl('/api/chat/changeOwner'), {
      ownerName: currConversation?.owner,
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
        await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
        //await db.conversations.update(conversation.chat_id, { owner: groupOwnerTmp });
        //conversation.owner = groupOwnerTmp;
        //setGroupOwner(groupOwnerTmp);
      }
      setVisibleOwner(false);
      setGroupOwnerTmp('');
    } else {
      alert("Somethng wrong");
      setVisibleOwner(false);
    }
    
  };
  const handleRemoveMemberOk = async() => {
    if(currConversation?.adminList) {
      if(userName !== currConversation?.owner && !currConversation?.adminList?.includes(removeMember)) {
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
          //await db.conversations.update(conversation.chat_id, { adminList: newAdminList });
          setSelectedMembers(newAdminList);
        }
        //conversation.memberList = newMemberList;
        await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
        // 更新成员列表
        //await db.conversations.update(conversation.chat_id, { memberList: newMemberList });
        //setMemberList(conversation.memberList);
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
        //conversation.memberList = conversation.memberList.filter(item => item !== userName);
        console.log(conversation.memberList);
        // 在数据库中更新
        //await db.conversations.update(conversation.chat_id, { memberList: conversation.memberList });
        //setMemberList(conversation.memberList);
        await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
      }
    } else {
      alert("Somethng wrong");
    }
    setVisibleWithdraw(false);
    setVisibleGroup(false);
  };
  const handleAddFriendOk =  () => {
    setSendingRequest(true)
    const content = requestMessage.trim();
    fetch(getUrl(`/api/sendFriendRequest/${memberToAddFriend}`), {
      method: 'POST',
      headers: {
          'Authorization': `${token}` // 发送本地token到后端
      },
      body: JSON.stringify({
        senderName : `${userName}`, 
        sendBySearch : false, 
        requestMessage : `${content}`
      }),
    })
    .then((res) => res.json())
    .then((res => {
        if(Number(res.code === 0)) {
            alert("Send Friend Request Successfully")
            setRequestMessage('')
            setVisibleAddFriend(false);
        }
        else {
          switch(Number(res.code)) {
              case 2:
                  alert('Invalid or expired JWT');
                  break;
              case 1:
                  alert('Target User Not Found');
                  break;
              case 3:
                  alert('Friend request already exists');
                  break;
              case 4:
                  alert("Cannot send friend request to yourself");
                  break;
              case 5:
                  alert("He/She is already your friend");
                  break;
              case 6:
                  alert("He/she has already sent a friend request to you, please handle it first")
                  break;
              default:
                  alert("Something Wrong!");
          }
        }
      }
    ))
    setSendingRequest(false)
    
  }
  const handleGroupInvitation = async (invt:GroupInvitation ,accept:Boolean) => {
    const {data} = await axios.post(getUrl('/api/chat/groupInvitation'), {
      userName: userName,
      invitation_id: invt.invitation_id,
      accept:accept
    }, {
      headers: {
        'Authorization': `${token}`
      }
    });
    if(data.code === 0) {
      fetchGroupInvitationList();
      await db.updateConversation(me,chat_id!,token).then(conv => {console.log(conv); setCurrConversation((oldconv) => conv)});
      alert(`Successfully ${accept ? `accepted` : `refused`} group invitation`)
    } else {
      alert(data.info);
    }
  }
  const getMemberIdentity = (member:string) => {
    const isMeSuffix =  me == member ? "（我）" : ""
    if(currConversation?.owner === member){return `（群主）${isMeSuffix}`}
    if(currConversation?.adminList?.includes(member)){return `（管理员）${isMeSuffix}`}
    return isMeSuffix
  }
  const memberListSortFunc = (a:string,b:string) => {
    if (a === currConversation?.owner) return -1;
    if (b === currConversation?.owner) return 1;

    // 管理员排在群主之后
    if (currConversation?.adminList?.includes(a) && !currConversation?.adminList?.includes(b)) return -1;
    if (currConversation?.adminList?.includes(b) && !currConversation?.adminList?.includes(b)) return 1;

    return a < b ? -1 : 1;
  }
  const goToFriendData = (userName: string, avatar:string) => {
    dispatch(setFriendName(userName));
    dispatch(setFriendAvatar(avatar));
    router.push(`/friendData/`);
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
            {getConversationDisplayName(currConversation,userName)}
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type='dashed' shape='circle' key={"settings"}  onClick={settings} className={styles.settings}>...</Button>
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
          <Button key="setAdmin" type="link" onClick={admin}  disabled = {!(currConversation?.owner == userName)}>设置管理员</Button>
          <Button key="setOwner" type="link" onClick={owner}  disabled = {!(currConversation?.owner == userName)}>设置群主</Button>
          <Button key="removeMember" type="link" onClick={removeMemberInit} disabled = {!(currConversation?.adminList?.includes(userName) || currConversation?.owner == userName)}>移除成员</Button>
          <Button key="groupInvitation" type="link" onClick={() => setVisibleGroupInvitationList(true)} disabled = {!(currConversation?.adminList?.includes(userName) || currConversation?.owner == userName)}>查看入群邀请</Button>
          <Button key="withdraw" type="dashed"  onClick={withdraw} style={{ color: 'red' }}>退出群聊</Button>
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
            <p>当前群管理员：{currConversation?.adminList ? currConversation.adminList.join(', ') : 'None'}</p>
            <p>请选择要设置为群管理员的成员：{selectedMembers.join(', ')}</p>
          </div>
          <List
            bordered
            dataSource={currConversation?.memberList.filter(item => item !== userName)}
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
            dataSource={currConversation?.memberList.slice(0).sort(memberListSortFunc)}
            renderItem={(member, index) => (
            <List.Item key={index} actions={[]}
            >{<Avatar src={`..${avatars[member]}`}></Avatar>} {member}{getMemberIdentity(member)}
            { member !== me ? (friendList.includes(member) ?  <Button  onClick={() => goToFriendData(member,avatars[member])}
            style={{ float: 'right',  margin: '0 10px',}}>
              {'查看详细'}</Button> : <Button onClick={() => {setVisibleAddFriend(true);setMemberToAddFriend(member)}}
            style={{ float: 'right',  margin: '0 10px',}}>
              {'添加好友'}</Button>
              
            ): null
            }
            </List.Item>
            )}

            />
            <Button onClick={() => setVisibleInviteFriend(true)} icon={( <PlusCircleOutlined /> )} style = {{  margin: '10px 0'} }/>
        </Modal>


        <Modal
        title="邀请好友"
        visible={visibleInviteFriend}
        onCancel={() => setVisibleInviteFriend(false)}
        footer={[
          <Button key="cancel" onClick={() => setVisibleInviteFriend(false)}>关闭</Button>,
          
        ]}
        >
          <List
            bordered
            dataSource={friendList.slice(0).sort((a:string ,b:string) => {return a < b ? -1 : 1})}
            renderItem={(friend) => (
            <List.Item key={friend} actions={[]}
            >{<Avatar src={currConversation?.memberList.includes(friend) ? `..${avatars[friend]}` :`..${friendAvatars[friend]}`}></Avatar>} {friend}
            { friend !== me ? (currConversation?.memberList.includes(friend) ?  <Button disabled={true}
            style={{ float: 'right',  margin: '0 10px',}}>
              {'已在群中'}</Button> : <Button onClick={() => {inviteFriend(friend)}}
            style={{ float: 'right',  margin: '0 10px',}}>
              {'邀请入群'}</Button>
            ): null
            }
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
            <p>当前群主为：{currConversation?.owner}</p>
            <p>请选择新的群主：{groupOwnerTmp}</p>
            <List
              bordered
              dataSource={currConversation?.memberList.filter(item => item !== userName)}
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
              dataSource={currConversation?.memberList.filter(item => item !== userName)}
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
          title="请填写好友验证信息"
          visible={visibleAddFriend}
          onCancel={handleAddFriendCancel}
          footer={[
            <Button key="cancel" onClick={handleAddFriendCancel}  disabled={sendingRequest}loading={sendingRequest} >取消</Button>,
            <Button key="create" type="primary" onClick={handleAddFriendOk}  disabled={sendingRequest}loading={sendingRequest} >确定</Button>
          ]}
          >
            <Input.TextArea
              placeholder='输入好友验证信息'
              className={styles.input}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey && !e.ctrlKey) {
                  e.preventDefault(); // 阻止默认事件
                  e.stopPropagation(); // 阻止事件冒泡
                  handleAddFriendOk();
                }
              }}
              rows={3}
              autoSize={false} // 关闭自动调整大小
              readOnly={sendingRequest} // 当正在发送消息时，设置输入框为只读
            />
        </Modal>
        <Modal
          title="入群邀请"
          visible={visibleGroupInvitationList}
          onCancel={()=>{setVisibleGroupInvitationList(false)}}
          footer={[
            <Button key="cancel" onClick={()=>{setVisibleGroupInvitationList(false)}}>关闭</Button>,
          ]}
          >
            <List
              bordered
              dataSource={groupInvitationList.slice(0).sort((a,b)=>{return b.created_time-a.created_time})}
              renderItem={(groupInvitation, index) => (
              <List.Item key={index}
              actions={groupInvitation.status === 0  ?
                [
                  <Button key={"add"} type='dashed' onClick={() =>{handleGroupInvitation(groupInvitation,true)}}><CheckOutlined /></Button>,
                  <Button key={"remove"} type='dashed' onClick={() => {handleGroupInvitation(groupInvitation,false)}}><CloseOutlined /></Button>
                ] :
                ( groupInvitation.status === 1 ? 
                  [<Button key={"remove"} type='dashed' disabled>已加入</Button>] :
                  [<Button key={"remove"} type='dashed' disabled>已拒绝</Button>]
                )
              }
              >
                <List.Item.Meta 
                title={`${groupInvitation.invitor}邀请${groupInvitation.invitee}加入群聊`}
                avatar = {<Avatar icon={(<MessageOutlined/>)}/>}
                description = {
                  `邀请时间：${formattime(groupInvitation.created_time)}`
                }
               >
                </List.Item.Meta>
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


      

      {/* <div>{replying!== 0 ?  messages?.filter((msg) => msg.message_id === replying)[0]?.content : ''}</div> */}
      <div className={replying ? styles.messages_haveReplyBubble : styles.messages}>
        {/* 消息列表容器 */}
        {messages?.filter((msg) => !msg.deleted).map((item) => (
          <div  key={item.message_id}  ref = {(el) => {
            if (el) {
              messageRefs.current.set(item.message_id, el);
            }
          }}>
          <MessageBubble 
          
          isMe={item.sender == me} 
          timestamp={item.created_time} 
          avatarPath={`..${avatars[item.sender]}`}
          setReplying={setReplying}
          scrollToReply = {scrollToMessage}
          replyingContent= {item.replying===0 ? '' : 
            messages.filter((msg) => msg.message_id === item.replying)
              .map((msg) => {
                return `${msg.sender}：${msg.content}`
              })[0]
          }
          {...item} />
          </div>
        ))}
        <div ref={messageEndRef} /> {/* 用于自动滚动到消息列表底部的空div */}
      </div>
      {conversation && (
        <>
          {replying ? <div style={{display: 'flex'}}><div className={styles.replyBubble}>
            {messages?.filter((msg) => msg.message_id === replying)
              .map((msg) => {
                return `${msg.sender}：${msg.content}`
              })[0]}
          </div>  <Button 
          onClick={() => {setReplying(0)}} 
          className={styles.cancelButton}
          shape='circle' >
            <CloseOutlined />
          </Button>
          </div>: null}
         
          <Input.TextArea
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                sendMessage();
              }
            }}
            rows={3}
            autoSize={false}
            readOnly={sending}
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

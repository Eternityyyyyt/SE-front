// 显示好友信息，由friend list路由而来
// 需要在前端存储需要访问的friend name，在当前页面GET

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect ,useState } from "react";
import { addConversation, } from '../api/chat';
import { Conversation } from "@/api/types";
import { db } from '../api/db';
import { useDispatch } from "react-redux";
import { setActiveChat } from "../redux/activeChat";
import styles from './avatar.module.css';
import { getUrl } from '../api/utils';
const FriendData = () => {
    const router = useRouter();
    const friendNickname = useSelector((state:RootState) => state.friend.friendName);//friend nickname
    const friendName = useSelector((state:RootState) => state.friend.friendName);//friend userName
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    const avatar = useSelector((state:RootState) => state.friend.friendAvatar);
    //const activeChatId = useSelector((state:RootState) => state.activeChat.chat_id);
    const dispatch = useDispatch();
    // GET 返回的好友信息
    const [fUserName, setFUserName] = useState('');
    const [fPhoneNumber, setFPhoneNumber] = useState('');
    const [fEmail, setFEmail] = useState('');
    const [fTag, setFTag] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async() => {
            try {
                fetch(getUrl(`/api/friendList/${userName}/${friendName}`), {
                    method: 'GET',
                    // 无需鉴权
                })
                .then((res) => res.json())
                .then((res) => {
                    if(Number(res.code) === 0) {
                        setFUserName(res.userData.userName);
                        setFPhoneNumber(res.userData.phoneNumber);
                        setFEmail(res.userData.email);
                        // 还没写TagList
                        setFTag(res.userData.tagList);

                    } else {
                        switch(Number(res.code)) {
                            case 1:
                                alert("User Not Found");
                                break;
                            default:
                                alert("Something Wrong");
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error('Error fetching friend requests:', error);
            }
        };
        fetchData();
    }, []);

    const GoToChat = async() => {
        const newChat = await addConversation({isGroup:false, memberList:[userName,friendName]}, token);; // 异步函数需要用await
        if(newChat) {
            const chatId = newChat.chat_id;
            console.log(chatId);
            await db.pullConversations(userName,[chatId],token);
            dispatch(setActiveChat(chatId));
            router.push('/chat');
        }
    };
    const GoBack = () => {router.back();};
    const DeleteFriend = () => {
        fetch(getUrl(`/api/friendList/${userName}/${friendName}`), {
            method: 'DELETE',
            headers: {
                'Authorization': `${token}`,
            },
        })
        .then((res) => res.json())
        .then((res) => {
            if(Number(res.code) === 0) {
                alert("Delete Successfully");
                router.push('/friendList')
            } else {
                switch(Number(res.code)) {
                    case 1:
                        alert("Not Found");
                        break;
                    case 2:
                        alert("Invalid or expired JWT");
                        break;
                    default:
                        alert("Something Wrong");
                        break;
                }
            }
        })
    };

    return (
        <div>
            <h2>好友信息</h2>
            <div className={styles.avatar}>
              {avatar && <img src={`..${avatar}`} alt="Avatar" className={styles.avatar} />}
            </div>
            <h3>User Name: {fUserName}</h3>
            <h3>Phone Number: {fPhoneNumber}</h3>
            <h3>Email: {fEmail}</h3>
            {/* Tag List */}
            <button onClick={GoToChat}>聊天</button>
            <button onClick={DeleteFriend}>删除好友</button>
            <button onClick={GoBack}>返回</button>
        </div>
    )
}

export default FriendData;
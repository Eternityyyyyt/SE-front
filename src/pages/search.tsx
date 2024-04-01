import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";


const SearchUser = () => {
    const [userName, setUsername] = useState('');
    const [nickname, setNickname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const router = useRouter();

    // 弹窗
    const [isModalOpen ,setModalOpen] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [sendBySearch, setSendBySearch] = useState(false);
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const senderName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    // 点击发送发送申请按钮
    const handleFriendRequest = () => {
        fetch(`/api/sendFriendRequest/${userName}`, {
            method: 'POST',
            headers: {
                'Authorization': `${token}` // 发送本地token到后端
            },
            body: JSON.stringify({senderName, sendBySearch, requestMessage}),
        })
        .then((res) => res.json())
        .then((res => {
            if(Number(res.code === 0)) {
                alert("Send Friend Request Successfully")
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
                    default:
                        alert("Something Wrong!");
                }
            }
        }))
        .finally(() => closeModal()); // 关闭弹窗
    };

    // 搜索用户
    const Search = () => {
        fetch(`/api/searchUser/${userName}`, {
            method: 'GET',
        })
        .then((res) => res.json())
        .then((res) => {
            if(Number(res.code) === 0) {
                setNickname(res.userData.nickname);
                setPhoneNumber(res.userData.phoneNumber);
                setEmail(res.userData.email);
                setSendBySearch(true);
            }
            else {
                setUsername('');
                setNickname('');
                setPhoneNumber('');
                setEmail('');
                setSendBySearch(false);
                alert("User not Found");
            }
        });
    };

    // 点击申请添加好友按钮
    const FriendRequest = () => {
        if(sendBySearch) {
            // 验证jwt令牌
            fetch(`/api/user/${senderName}`,{
                method: 'GET',
                headers: {
                  'Authorization': `${token}`
                },
            })
                .then((res) => res.json())
                .then((res) => {
                    if(Number(res.code) === 0) {
                        openModal();        // 如果身份验证通过则跳出弹窗
                    }
                    else {
                        switch(Number(res.code)) {
                            case 2:
                                alert('Invalid or expired JWT');
                                break;
                            case 1:
                                alert('Sender not found');
                                break;
                            case 3:
                                alert('Friend request already exists');
                                break;
                            case 4:
                                alert("Cannot send friend request to yourself");
                                break;
                            default:
                                alert("Something Wrong!");
                                console.log(res.code);
                        };
                    }
                })

            
        }
        else {
            alert("Target User Not Found");
        }
    };

    const GoBack = () => {
        router.back();
      }


    return (
        <div>
            <button onClick={GoBack}>返回</button>
            <h1>用户搜索</h1>
            <div>
                <label htmlFor="userName">用户名：</label>
                <input type="text" id="userName" value={userName} onChange={e => setUsername(e.target.value)}></input>
            </div>
            <button onClick={Search}>搜索</button>
            <h2>搜索结果：</h2>
            <h3>用户名：{userName}</h3>
            <h3>昵称：{nickname}</h3>
            <h3>电话号码：{phoneNumber}</h3>
            <h3>邮箱：{email}</h3>
            <button onClick={FriendRequest}>申请添加好友</button>
            {/* 弹窗 */}
            {isModalOpen && (
                <div className="friend-request-modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>申请添加好友</h2>
                        <p>请输入您的好友请求信息：</p>
                        <textarea
                            value={requestMessage}
                            onChange={e => setRequestMessage(e.target.value)}
                            placeholder="在这里写下您的好友请求信息..."
                        />
                        <button onClick={handleFriendRequest}>发送请求</button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default SearchUser;
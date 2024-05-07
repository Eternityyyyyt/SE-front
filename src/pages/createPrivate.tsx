// 暂时用新页面比较方便
import { useState } from "react";
import { useRouter } from "next/router";
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { addChatId } from "@/redux/auth";
import { getUrl } from '../api/utils';

const CreatePrivateChat = () => {
    const createrName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);

    const [memberName, setMemberName] = useState('');
    // 目前还是和auth一样存储
    // chat_id可以重复创建（后端问题）
    const router = useRouter();
    const dispatch = useDispatch();

    const handleCreateChat = () => {
        fetch(getUrl(`api/chat/createPrivate`), {
            method: 'POST',
            headers: {
                'Authorization': `${token}`
            },
            body: JSON.stringify({
                createrName,
                memberName
            })
        })
        .then((res) => res.json())
        .then((res) => {
            if(Number(res.code) === 0) {
                console.log(res.data.chat_id);
                dispatch(addChatId(Number(res.data.chat_id)));
                alert(`Created! The chat id is ${res.data.chat_id}`);
                router.back();
            } else {
                switch(Number(res.code)) {
                    case 1:
                        alert("Not Found");
                        break;
                    case 2:
                        alert("Invalid or expired JWT");
                        break;
                    case 3:
                        alert("User <userName> is not in chat <chatName>");
                        break;
                    default:
                        alert("Something Wrong");
                        break;
                }
            }
        })
    };

    const GoBack = () => {
        router.back();
    }

    return(
        <div>
            <h2>Create Private Chat</h2>
            <div>
                <label>Member Name:</label>
                <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} />
            </div>
            <button onClick={handleCreateChat}>Create Chat</button>
            <div>
                <button onClick={GoBack}>返回</button>
            </div>
        </div>
    );

};

export default CreatePrivateChat;
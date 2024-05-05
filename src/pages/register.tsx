import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from './avatar.module.css';

const RegisterPage = () => {
    const [userName, setUsername] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const router = useRouter();

    useEffect(() => {
        // console.log(selectedAvatar);
    }, [selectedAvatar]);

    const handleRegister = async () => {
        if (!userName || !password || !email || !phoneNumber || !selectedAvatar) {
            alert("请填写所有必填信息。");
            return;
        }

        try {
            console.log(selectedAvatar);
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({userName,nickname, password, phoneNumber, email, avatar: selectedAvatar})
            });

            if (response.ok) {
                router.push('/login');
            } else {
                console.error('Registration Failed');
                const data = await response.json();
                console.log(data);
                switch(Number(data.code)) {
                    case 1:
                        alert('User already exist');
                        break;
                    case -2:
                        alert(data.info);
                        break;
                    case -3:
                        alert('Bad method');
                        break;
                    default:
                        alert('注册失败');
                }
            }
        }
        catch (error) {
            console.error('Error during Registration:', error);
        }
    };
    const gotoIndex = () => {
        router.push('/');
    };

    const handleAvatarClick = (avatar:any) => {
        const avatarPath:string = `/avatar/${avatar}.png`;
        setSelectedAvatar(avatarPath);
        console.log(avatar);
    };

    return (
        <div>
            <h1>Register</h1>
            <div>
                <label htmlFor="userName">用户名：</label>
                <input type="text" id="userName" value={userName} onChange={e => setUsername(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="userName">昵称：</label>
                <input type="text" id="nickname" value={nickname} onChange={e => setNickname(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="password">密码：</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="phoneNumber">手机号：</label>
                <input type="tel" id="phoneNumber" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="email">邮箱：</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)}></input>
            </div>
            <div>
                <h3>选择头像</h3>
                <div className={styles.avatarContainer}> 
                    {Array.from(Array(15).keys()).map(index => (
                        <img
                            key={index}
                            src={`../avatar/${index < 10 ? '0' + index : index}.png`}
                            alt={`Avatar ${index}`}
                            className={selectedAvatar === `/avatar/${index < 10 ? '0' + index : index}.png` ? styles.selected : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAvatarClick(index < 10 ? '0' + index : index)}
                        />
                    ))}
                </div>
            </div>
            <div>
                <button onClick={handleRegister}>注册</button>
                <button onClick={gotoIndex}>首页</button>
            </div>
        </div>
    );
};
export default RegisterPage;
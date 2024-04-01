import { useState } from "react";
import { useRouter } from "next/router";

const RegisterPage = () => {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        if (!userName || !password || !email || !phoneNumber) {
            alert("请填写所有必填信息。");
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({userName, password, phoneNumber, email})
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
                        alert('Bad length of [phoneNumber]');
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

    return (
        <div>
            <h1>Register</h1>
            <div>
                <label htmlFor="userName">用户名：</label>
                <input type="text" id="userName" value={userName} onChange={e => setUsername(e.target.value)}></input>
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
                <button onClick={handleRegister}>注册</button>
                <button onClick={gotoIndex}>首页</button>
            </div>
        </div>
    );
};
export default RegisterPage;
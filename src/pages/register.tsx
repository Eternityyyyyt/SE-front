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
                switch(data.info) {
                    case 'User already exists':
                        alert('用户已存在');
                        break;
                    case 'Bad length of [phoneNumber]':
                        alert('电话号码长度不对');
                        break;
                    case 'Bad format of [email]':
                        alert('邮箱格式不正确');
                        break;
                    default:
                        alert('注册失败：' + data.error.message);
                }
            }
        }
        catch (error) {
            console.error('Error during Registration:', error);
        }
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
            </div>
        </div>
    );
};
export default RegisterPage;
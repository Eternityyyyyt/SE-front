import { useState } from "react";
import { useRouter } from "next/router";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {   // 使用Fetch API向指定URL发送POST请求
            const response = await fetch('/register', {  // 转发到next.config.mjs中转发
              method: 'POST',
              headers: {
                'Content-Type':'application/json' // 设置请求头信息，指定了请求体的数据类型为JSON格式
              },
              body: JSON.stringify({username, password})
            });
            if(response.ok) {
              router.push('/login');
            } else {
              console.error('Registration Failed');
            } 
          }
          catch(error) {
              console.error('Error during Registration:', error);
          }

    };

    return (
        <div>
            <h1>Register</h1>
            <div>
                <label htmlFor="username">用户名：</label>
                <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="password">密码：</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}></input>
            </div>
            <button onClick={handleRegister}>Login</button>
        </div>
    );
};
export default RegisterPage;
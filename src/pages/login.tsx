import { useState } from "react";
import { useRouter } from "next/router";

const LoginPage = () => {
  const [userName, setUsername] = useState('');   // hook
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {   // 使用Fetch API向指定URL发送POST请求
      const response = await fetch('/api/login', {  // 转发到next.config.mjs中转发
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // 设置请求头信息，指定了请求体的数据类型为JSON格式
        },
        body: JSON.stringify({ userName, password })
      });
      if (response.ok) {
        router.push('/chat');
      } else {
        router.push('/404');
        console.error('Login Failed');
      }
    }
    catch (error) {
      console.error('Error during login:', error);
    }
  };
  return (
    <div>
      <h1>Login</h1>
      <div>
        <label htmlFor="userName">用户名：</label>
        <input type="text" id="userName" value={userName} onChange={e => setUsername(e.target.value)}></input>
      </div>
      <div>
        <label htmlFor="password">密码：</label>
        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)}></input>
      </div>
      <button onClick={handleLogin}>登录</button>
    </div>
  );

};

export default LoginPage;
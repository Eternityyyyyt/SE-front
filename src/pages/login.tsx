import { useState } from "react";
import { useRouter } from "next/router";
import localforage from "localforage";

const LoginPage = () => {
  const [userName, setUsername] = useState('');   // hook
  const [password, setPassword] = useState('');
  const router = useRouter();

  const jumptoRegister = () => {
    router.push('/register');
  };
  const handleLogin = async () => {
    try {   // 使用Fetch API向指定URL发送POST请求
      const response = await fetch('/api/login', {  // 转发到next.config.mjs中转发
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 设置请求头信息，指定了请求体的数据类型为JSON格式
        },
        body: JSON.stringify({userName, password})
      });
      if (response.ok) {
        const data = await response.json();
        if(data.token) {
          // 在前端存储相应信息
          localforage.setItem('userName', userName);
          localforage.setItem('password', password);
          localforage.setItem('token', data.token);
          console.log(data.token);
          
          router.push('/chat');
        }
        else {
          console.error('Token not found in response');
          alert('登录失败：未获取到令牌');
        }
        
      } else {
        console.error('Login Failed');
        const data = await response.json();
        console.log(data);
        switch(data.info) {
          case 'Wrong password':
            alert('密码错误');
            break;
          case 'Bad Method':
            alert('错误请求');
            break;
          case 'User does not exist':
            alert('用户不存在');
            break;
          default:
            alert('登录失败：' + data.error.message);
        };
      };
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
      <button onClick={jumptoRegister}>注册</button>
    </div>
  );

};

export default LoginPage;
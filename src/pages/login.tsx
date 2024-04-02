import { useState } from "react";
import { useRouter } from "next/router";
import { setName, setToken } from "../redux/auth";
import { useDispatch } from "react-redux";

const LoginPage = () => {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const jumptoRegister = () => {
    router.push('/register');
  };
  
  const handleLogin = () => {
    fetch('/api/login',{
      method: 'POST',
      body: JSON.stringify({userName, password}),
    })
      .then((res) => res.json())
      .then((res) => {
        if(Number(res.code) === 0) {
          dispatch(setName(userName));
          dispatch(setToken(res.token));
          alert("登录成功" + userName);
          router.push('/chat');
        }
        else {
          switch(Number(res.code)) {
            case 2:
              alert('密码错误');
              break;
            case -3:
              alert('错误请求');
              break;
            case 1:
              alert('用户不存在');
              break;
            default:
              alert('登录失败');
              console.log(res.code);
          };
        }
      });
      
    
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
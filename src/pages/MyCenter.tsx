import React, { useState, useEffect } from 'react';
import { useRouter } from "next/router";
import localforage from "localforage";

const MyCenter = () => {
    const [userName, setUserName] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [email, setEmail] = useState(null);
    const [token, setToken] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setUserName(await localforage.getItem('userName'));
                setPhoneNumber(await localforage.getItem('phoneNumber'));
                setEmail(await localforage.getItem('email'));
                setToken(await localforage.getItem('token'));

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);
    
    const deleteUser = async() => {
        try {
            const response = await fetch(`/api/user/${userName}`, { 
              method: 'DELETE',
              headers: {
                'Authorization': `${token}` // 发送本地token到后端
              },
            });
            if (response.ok) {
                alert('删除成功');
                router.push('/');
            } else {
                const data = await response.json();
                switch(data.info) {
                    case 'Invalid or expired JWT':
                        alert('非法JWT令牌');
                        break;
                    case 'User not found':
                        alert('用户不存在');
                        break;
                    case 'Cannot view info of other users':
                        alert('不能查看其他用户信息');
                        break;
                    default:
                        alert(data.error.message);
                };
            }
      
            
            
            
        } 
        catch (error) {
            console.error('Error checking token:', error);
            alert('发生错误，请重试。');
        }
    };
    return (
        <div>
            <h1>My Center-用户中心</h1>
            <h2>用户名：{userName}</h2>
            <h2>手机号：{phoneNumber}</h2>
            <h2>邮箱：{email} </h2>
            <button onClick={deleteUser}>注销用户</button>
        </div>
    );
};
export default MyCenter;
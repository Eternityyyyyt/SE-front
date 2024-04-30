import React, {useEffect } from 'react';
import { useRouter } from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import { resetAuth } from '@/redux/auth';
import { RootState } from "@/redux/store";
import styles from './avatar.module.css';

const MyCenter = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const userName = useSelector((state:RootState) => state.auth.name);
    const nickname = useSelector((state:RootState) => state.auth.nickname);
    const phoneNumber = useSelector((state:RootState) => state.auth.phoneNumber);
    const email = useSelector((state:RootState) => state.auth.email);
    const token = useSelector((state:RootState) => state.auth.token);
    const avatar = useSelector((state:RootState) => state.auth.avatar);
    const avatarPath:string = `..${avatar}`;
    console.log(avatarPath);

    useEffect(() => {
        if(!userName || !token) {
            router.push('/login');
        }
    }, [userName, token, router]);
    
    const deleteUser = () => {
        fetch(`/api/user/${userName}`,{
            method: 'DELETE',
            headers: {
              'Authorization': `${token}` // 发送本地token到后端
            },
          })
            .then((res) => res.json())
            .then((res) => {
              if(Number(res.code) === 0) {
                alert("删除成功");
                dispatch(resetAuth());
                router.push('/');
              }
              else {
                switch(Number(res.code)) {
                  case 2:
                    alert('非法JWT令牌');
                    break;
                  case 1:
                    alert('用户不存在');
                    break;
                  case 3:
                    alert('不能查看其他用户信息');
                    break;
                  default:
                    alert("删除失败");
                    console.log(Number(res.code));
                };
              }
            });
    };
    const gotoIndex = () => {
      router.push('/');
    };
    const GoBack = () => {
      router.back();
    }
    const revise = () => {
      router.push('/revise');
    }
    return (
        <div>
            <button onClick={GoBack}>返回</button>
            <button onClick={gotoIndex}>首页</button>
            <h1>My Center-用户中心</h1>
            <div className={styles.avatar}>
              {<img src={avatarPath} alt="Avatar" className={styles.avatar} />}
            </div>
            <h2>用户名：{userName}</h2>
            <h2>昵称：{nickname}</h2>
            <h2>手机号：{phoneNumber}</h2>
            <h2>邮箱：{email} </h2>
            <div>
              <button onClick={revise}>用户信息编辑</button>
            </div>
            <button onClick={deleteUser}>注销用户</button>
            
        </div>
    );
};
export default MyCenter;
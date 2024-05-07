
import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setPhoneNumber, setEmail, setNickname, setAvatar, resetAuth } from "@/redux/auth";
import styles from './Buttons.module.css';
import { Divider, message ,Button } from 'antd';
import { getUrl } from '../api/utils';

const Buttons = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const token = useSelector((state:RootState) => state.auth.token);
    const userName = useSelector((state:RootState) => state.auth.name);
  
    const MyCenter = () => {
        fetch(getUrl(`/api/user/${userName}`),{
          method: 'GET',
          headers: {
            'Authorization': `${token}` // 发送本地token到后端
          },
        })
          .then((res) => res.json())
          .then((res) => {
            if(Number(res.code) === 0) {
              dispatch(setPhoneNumber(res.userData.phoneNumber));
              dispatch(setEmail(res.userData.email));
              dispatch(setNickname(res.userData.nickname));
              dispatch(setAvatar(res.userData.avatar));
              router.push('/MyCenter');
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
                  alert("Something Wrong!");
                  console.log(res.code);
              };
            }
          });
    
      };
    
      const SearchUser = () => {
        router.push('/search');
      };
    
      const FriendRequestList = () => {
        router.push('/friendRequestList');
      };
      const gotoIndex = () => {
        dispatch(resetAuth());
        router.push('/');
      };
      const FriendList = () => {
        router.push('/friendList');
      };
    return (
        <div className={styles.buttons}>
        <Button onClick={FriendRequestList}>好友申请列表</Button>
        <Button onClick={FriendList}>好友列表</Button>
        <Button onClick={MyCenter}>个人用户中心</Button>
        <Button onClick={SearchUser}>搜索用户</Button>
        <Button onClick={gotoIndex}>退出登录</Button>
        </div>
    )
}

export default Buttons;
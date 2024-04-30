import React, { useState } from 'react';
import { useRouter } from "next/router";
import { useSelector, UseDispatch, useDispatch } from 'react-redux';
import { RootState } from "@/redux/store";
import { setAvatar, setEmail, setPhoneNumber, setNickname } from '@/redux/auth';
import styles from './avatar.module.css';

const Revise = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);

    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newAvatar, setNewAvatar] = useState('');



    const goBack = () => {
        router.push('/MyCenter');
    };
    const handleAvatarClick = (avatar:any) => {
        const avatarPath:string = `/avatar/${avatar}.png`
        setNewAvatar(avatarPath);
        console.log(newAvatar);
    };
    const submit = () => {
        if(newAvatar) {dispatch(setAvatar(newAvatar));}
        if(newPhoneNumber) {dispatch(setPhoneNumber(newPhoneNumber));}
        if(newEmail) {dispatch(setEmail(newEmail));}
        if(newName) {dispatch(setNickname(newName));}
        
        fetch(`/api/revise/${userName}`, {
            method: 'POST',
            headers: {
                'Authorization': `${token}`
            },
            body: JSON.stringify({newName, newPassword, oldPassword, newPhoneNumber, newEmail, newAvatar})
        })
        .then((res) => res.json())
        .then((res) => {
            if(Number(res.code === 0)) {
                alert("Revise Successfully")
                router.push('/MyCenter');
            }
            else {
                switch(Number(res.code)) {
                    case 2:
                        alert('Invalid or expired JWT');
                        break;
                    case 1:
                        alert("Not Found");
                        break;
                    case 3:
                        alert("Cannot revise other's information");
                        break;
                    case 4:
                        alert("Wrong Password");
                        break;
                    default:
                        alert("Something Wrong");
                        break;
                }
            }
        })
    };


    return (
        <div>
            <button onClick={goBack}>返回</button>
            <div>
                <label htmlFor="newName">newName: </label>
                <input type="text" id="newName" value={newName} onChange={e => setNewName(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="newPassword">newPassword: </label>
                <input type="text" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="oldPassword">oldPassword(must): </label>
                <input type="text" id="oldPassword" value={oldPassword} onChange={e => setOldPassword(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="newPhoneNumber">newPhoneNumber: </label>
                <input type="text" id="newPhoneNumber" value={newPhoneNumber} onChange={e => setNewPhoneNumber(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="newEmail">newEmail: </label>
                <input type="text" id="newEmail" value={newEmail} onChange={e => setNewEmail(e.target.value)}></input>
            </div>
            <div>
                <label htmlFor="newAvatar">newAvatar: </label>
                <div className={styles.avatarContainer}> 
                    {Array.from(Array(15).keys()).map(index => (
                        <img
                            key={index}
                            src={`../avatar/${index < 10 ? '0' + index : index}.png`}
                            alt={`Avatar ${index}`}
                            className={newAvatar === `/avatar/${index < 10 ? '0' + index : index}.png` ? styles.selected : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleAvatarClick(index < 10 ? '0' + index : index)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <button onClick={submit}>提交修改</button>
            </div>

            

        </div>
    );
    

    

};
export default Revise;
import React, {useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import styles from './avatar.module.css';

const Revise = () => {
    const router = useRouter();
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);

    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newAvatar, setNewAvatar] = useState('');



    const goBack = () => {
        router.back();
    };
    const handleAvatarClick = (avatar:any) => {
        setNewAvatar(avatar);
    };
    const submit = () => {
        fetch(`/api/revise/${userName}`, {
            method: 'POST',
            headers: {
                'Authorization': `${token}`
            },
            body: JSON.stringify({newName, newPassword, oldPassword, newPhoneNumber, newEmail, newAvatar})
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
                <label htmlFor="oldPassword">oldPassword: </label>
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
import React, {useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import { resetAuth } from '@/redux/auth';
import { RootState } from "@/redux/store";

const Revise = () => {
    const router = useRouter();
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);

    const [modifiedUserName, setModifiedUserName] = useState('');
    const [modifiedEmail, setModifiedEmail] = useState('');
    const [modifiedPhoneNumber, setModifiedPhoneNumber] = useState('');
    const [modifiedPassword, setModifiedPassword] = useState('');


    const goBack = () => {
        router.back();
    };


    return (
        <div>
            <button onClick={goBack}>返回</button>
            <h2>确认信息</h2>
        </div>
    );
    

    

};
export default Revise;
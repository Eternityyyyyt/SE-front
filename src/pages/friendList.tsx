// 好友列表页面
import React from 'react';
import dynamic from 'next/dynamic';
const Tag = dynamic(() => import('../components/Tag'), { ssr: false });



const FriendList = () => {
    
    return (
        <div>
            <Tag />
        </div>
    )
}

export default FriendList;
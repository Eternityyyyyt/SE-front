import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "@/redux/store";
import { useRouter } from 'next/router';

interface FriendRequest {
    request_id: string;
    sender: string;
    receiver: string;
    created_time: string;
    sendBySearch: boolean;
    requestMessage: string;
    status: number;
}

const FriendRequestList = () => {
    const userName = useSelector((state:RootState) => state.auth.name);
    const token = useSelector((state:RootState) => state.auth.token);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(userName);
                const response = await fetch(`/api/friendRequest/${userName}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}` // 发送本地token到后端
                    },
                });
                const data = await response.json();
                if (Number(data.code) === 0) {
                    setFriendRequests(data.data);
                } else {
                    switch(Number(data.code)) {
                        case 2:
                            alert('Invalid or expired JWT');
                            break;
                        case 1:
                            alert('Not Found');
                            break;
                        case 3:
                            alert('Cannot view others friend requests');
                            break;
                        default:
                            alert('Unknown error');
                            console.log(data.info)
                    }
                }
            } catch (error) {
                console.error('Error fetching friend requests:', error);
            }
        };

        fetchData();
    }, [userName]);

    const Accept = async (requestId: string) => {
        try {
            const response = await fetch(`/api/friendRequest/${userName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({
                    request_id: requestId,
                    accept: true
                }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                console.log('Friend request accepted successfully');
                alert("Friend request accepted successfully");
                router.push('/chat');
            } else {
                switch(Number(data.code)){
                    case 1:
                        alert("Not Found");
                        break;
                    case 2:
                        alert("Invalid or expired JWT");
                        break;
                }

                
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };
    
    const Deny = async (requestId: string) => {
        try {
            const response = await fetch(`/api/friendRequest/${userName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({
                    request_id: requestId,
                    accept: false
                }),
            });
            const data = await response.json();
            if (Number(data.code) === 0) {
                console.log('Friend request denied successfully');
                alert("Friend request denied successfully")
                router.push('/chat');
            } else {
                switch(Number(data.code)){
                    case 1:
                        alert("Not Found");
                        break;
                    case 2:
                        alert("Invalid or expired JWT");
                        break;
                }

            }
        } catch (error) {
            console.error('Error denying friend request:', error);
        }
    };

    const GoBack = () => {
        router.back();
    };
    

    return (
        <div>
            <button onClick={GoBack}>返回</button>
            {friendRequests.length === 0 ? (
                <p>No friend requests</p>
            ) : (
                <ul>
                    {friendRequests.map((request) => (
                        <li key={request.request_id}>
                            <p>Sender: {request.sender}</p>
                            <p>Create Time: {request.created_time}</p>
                            <p>Status: {getStatusText(request.status)}</p>
                            <p>Request Message: {request.requestMessage}</p>
                            {request.status === 0 && (
                                <>
                                    <button onClick={() => Accept(request.request_id)}>接受</button>
                                    <button onClick={() => Deny(request.request_id)}>拒绝</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return 'Processing';
        case 1:
            return 'Accepted';
        case -1:
            return 'Rejected';
        default:
            return 'Unknown';
    }
};

export default FriendRequestList;

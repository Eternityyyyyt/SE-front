import { useRouter } from "next/router";


const myCenter = () => {
    const userName = localStorage.getItem('userName');
    const phoneNumber = localStorage.getItem('phoneNumber');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const router = useRouter();
    const deleteUser = async() => {
        try {
            const response = await fetch(`/api/user/${userName}`, { 
              method: 'DELETE',
              headers: {
                'Authorization': `${token}` // 发送本地token到后端
              },
            });
            if (response.ok) {
              const data = await response.json();
                alert('删除成功');
                router.push('/');
            } else {
                
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
export default myCenter;
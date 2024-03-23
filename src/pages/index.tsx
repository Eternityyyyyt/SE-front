import Link from "next/link";
// 首页
const IndexPage = () => (
  <div>
    <h1>首页</h1>
    <Link href="/login">登录</Link>
    <Link href="/register">注册</Link>
  </div>
);

export default IndexPage;
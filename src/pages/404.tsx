import Link from "next/link";

const NotFoundPage404 = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <Link href="/">Go Back To HomePage!</Link>
        </div>
    );
};
export default NotFoundPage404;
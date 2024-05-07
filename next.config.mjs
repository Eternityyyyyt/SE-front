/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [
        //     {
        //     source: "/api/:path*",
        //     // Change to your backend URL in production
        //     // "https://SE-back-magic.app.secoder.net/:path*"
        //     destination: process.env.NODE_ENV !== 'production' ? "http://127.0.0.1:8000/:path*" :  "https://se-back-magic.app.secoder.net/:path*",
        // }
        // ,{
        //     source: "/apiws/:path*",
        //     // Change to your backend URL in production
        //     // "https://SE-back-magic.app.secoder.net/:path*"
        //     destination: process.env.NODE_ENV !== 'production' ? "ws://127.0.0.1:8000/:path*" :  "wss://se-back-magic.app.secoder.net/:path*",
        // }
        
    
        ];
    }
};

export default nextConfig;

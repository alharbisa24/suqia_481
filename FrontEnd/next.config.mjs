/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    env: {
        API_URL: process.env.API_URL,
      },
};


export default nextConfig;

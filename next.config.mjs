/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'plan.navcanada.ca',
          pathname: '/weather/images/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  
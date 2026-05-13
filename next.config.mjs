/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "pannellum.org" },
      { protocol: "https", hostname: "my.matterport.com" },
      { protocol: "https", hostname: "cdn-1.matterport.com" },
      { protocol: "https", hostname: "cdn-2.matterport.com" },
      { protocol: "https", hostname: "*.matterportvr.cn" },
      { protocol: "https", hostname: "www.pikproperty.com" },
      { protocol: "https", hostname: "pikproperty.com" },
    ],
  },
};
export default nextConfig;

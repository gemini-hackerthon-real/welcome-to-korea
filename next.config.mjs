/** @type {import('next').NextConfig} */
const nextConfig = {
  // Three.js 트랜스파일 설정
  transpilePackages: ['three'],

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },

  // 실험적 기능
  experimental: {
    // 서버 액션 활성화
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // webpack 설정 (Three.js GLSL 파일 등)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    return config;
  },
};

export default nextConfig;

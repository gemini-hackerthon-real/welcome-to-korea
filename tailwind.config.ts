import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 지역별 테마 컬러
        gyeongbokgung: {
          primary: "#8B4513",
          secondary: "#DAA520",
          accent: "#2F4F4F",
        },
        itaewon: {
          primary: "#FF1493",
          secondary: "#00CED1",
          accent: "#FFD700",
        },
        hongdae: {
          primary: "#9370DB",
          secondary: "#FF6347",
          accent: "#00FA9A",
        },
        gangnam: {
          primary: "#4169E1",
          secondary: "#C0C0C0",
          accent: "#000080",
        },
      },
    },
  },
  plugins: [],
};

export default config;

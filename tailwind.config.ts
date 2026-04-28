import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- DEFINISI WARNA DNA LOGO ASKARA INDONESIA ---
        askara: {
          dark: '#3F00FF',    // Ungu Tua khas Askara
          orange: '#FF8C00',  // Orange khas Indonesia
          light: '#F8F9FE',   // Background Putih Keunguan sangat muda
          gray: '#6B7280',    // Abu-abu teks
        },
      },
    },
  },
  plugins: [],
};
export default config;
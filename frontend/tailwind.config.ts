import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./pages/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [animate],
};

export default config;
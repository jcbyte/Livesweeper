const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(alert|button|input|snippet|spinner|ripple|form|popover).js"
  ],
	theme: {
		extend: {},
	},
	plugins: [
		heroui({
			themes: {
				dark: {
					colors: {
						foreground: "#E5E7EB",
						background: "#1A1B26",
						primary: {
							foreground: "#E5E7EB",
							DEFAULT: "#9333EA",
						},
						secondary: {
							foreground: "#E5E7EB",
							DEFAULT: "#FF5370",
						},
						success: {
							foreground: "#E5E7EB",
							DEFAULT: "#1E8C4F",
						},
						warning: {
							foreground: "#E5E7EB",
							DEFAULT: "#B45309",
						},
						danger: {
							foreground: "#E5E7EB",
							DEFAULT: "#DC2626",
						},
					},
				},
			},
		}),
	],
};

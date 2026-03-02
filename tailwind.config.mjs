/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dark terminal palette — matches BJJQuadTreeViz aesthetic
        bg:           '#050509',
        surface:      '#0E1014',
        border:       '#1C1F26',
        accent:       '#4C8DFF',
        'accent-soft':'#A970FF',
        cyan:         '#00FFFF',
        'text-primary': '#E5E7EB',
        'text-muted':   '#9CA3AF',
        'text-dim':     '#6B7280',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};

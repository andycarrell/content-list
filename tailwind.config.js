module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      backgroundImage: () => ({
        checkbox: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' fill='%23FFFFFF'%3E%3Cpolygon points='5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039' clip-rule='evenodd' /%3E%3C/svg%3E")`,
      }),
    },
  },
  plugins: [],
};

module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff7ef",
        latte: "#f4dfca",
        caramel: "#bf7b44",
        mocha: "#523122",
        cocoa: "#2d1a12",
        rose: "#f3c9c4",
        sage: "#cbd6b6"
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(82, 49, 34, 0.12)",
        float: "0 18px 45px rgba(191, 123, 68, 0.22)"
      },
      backgroundImage: {
        "bakery-glow":
          "radial-gradient(circle at top left, rgba(255,255,255,0.95), rgba(255,247,239,0.65) 40%, rgba(244,223,202,0.9) 100%)"
      }
    }
  },
  plugins: []
};

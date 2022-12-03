module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  ignorePatterns: [
    "/netlify/functions/server",
    "/node_modules",
    "/public/build",
    "/server/build",
  ],
};

const fs = require("fs");

exports.readJSON = (path) => {
  if (!fs.existsSync(path))
    return fs.writeFileSync(path, JSON.stringify([]), "utf-8") || [];

  const data = fs.readFileSync(path, "utf-8");
  if (!data) return [];
  return JSON.parse(data);
};

exports.writeJSON = (path, data) => {
  console.log(data);
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
};

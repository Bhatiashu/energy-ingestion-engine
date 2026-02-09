require("dotenv").config();   // MUST be first
const app = require("./app");
const connectDB = require("./config/db");

connectDB();

app.listen(3000, () => console.log("Server running on 3000"));


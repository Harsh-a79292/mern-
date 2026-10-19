import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"; // 1. Yeh import yahan add karna hai

dotenv.config({ path: "./.env" });

// 2. Yahan jo akela connectDB(); likha tha, use hata diya hai

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
import 'dotenv/config'; // Yeh line sabse upar honi chahiye!
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
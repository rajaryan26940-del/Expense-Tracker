const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Connection Error:");
        console.error(error);
        process.exit(1);
    }
}

testConnection();
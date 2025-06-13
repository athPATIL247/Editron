const mongoose = require("mongoose");

const connectToMongo = async (url) => {
    try {
        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            family: 4 // Use IPv4, skip trying IPv6
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit if cannot connect to database
    }
}

module.exports = connectToMongo;
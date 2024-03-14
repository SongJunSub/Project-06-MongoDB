const express = require("express");
const app = express();
const { userRouter, BlogRouter} = require("./routes");
const mongoose = require("mongoose");

const mongoDBURL = "mongodb+srv://admin:admin@mongodbtutorial.kngs2ei.mongodb.net/BlogService?retryWrites=true&w=majority&appName=BlogService";

const server = async () => {

    try {
        await mongoose.connect(mongoDBURL);
        console.log("MongoDB Connected");
        mongoose.set("debug", true);

        app.use(express.json());
        app.use("/user", userRouter);
        app.use("/blog", BlogRouter);

        app.listen(3000, () => console.log("Server Listening On Port 3000"));
    }
    catch(e) {
        console.log(e);
    }

}

server();
const express = require("express");
const app = express();
const { userRouter, BlogRouter} = require("./routes");
const mongoose = require("mongoose");
//const { generateFakeData } = require("../faker");
const { generateFakeData } = require("../faker2");

const mongoDBURL = "mongodb+srv://admin:admin@mongodbtutorial.kngs2ei.mongodb.net/BlogService?retryWrites=true&w=majority&appName=BlogService";

const server = async () => {

    try {
        await mongoose.connect(mongoDBURL);
        console.log("MongoDB Connected");
        mongoose.set("debug", true);

        app.use(express.json());
        app.use("/user", userRouter);
        app.use("/blog", BlogRouter);

        app.listen(3000, async () => {
            console.log("Server Listening On Port 3000");

            //Faker를 이용하여 가상 데이터 생성
            // for(let i=0; i<20; i++){
            // await generateFakeData(3, 10, 50);
            // }
        });
    }
    catch(e) {
        console.log(e);
    }

}

server();
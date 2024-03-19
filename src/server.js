const express = require("express");
const app = express();
const { userRouter, BlogRouter} = require("./routes");
const mongoose = require("mongoose");
//const { generateFakeData } = require("../faker");
const { generateFakeData } = require("../faker2");

const server = async () => {

    try {
        const {mongoDBURL} = process.env;

        if(!mongoDBURL) throw Error("mongoDBURL is required.")

        await mongoose.connect(mongoDBURL);
        console.log("MongoDB Connected");
        //mongoose.set("debug", true);

        app.use(express.json());
        app.use("/user", userRouter);
        app.use("/blog", BlogRouter);

        app.listen(3000, async () => {
            console.log("Server Listening On Port 3000");

            //Faker를 이용하여 가상 데이터 생성
            //console.time("Insert Start");
            //await generateFakeData(10, 2, 15);
            //console.timeEnd("Insert End");
        });
    }
    catch(e) {
        console.log(e);
    }

}

server();
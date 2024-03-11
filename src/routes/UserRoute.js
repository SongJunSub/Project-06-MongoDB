const { Router } = require("express");
const userRouter = Router();
const mongoose = require("mongoose");
const { User } = require("../models/User");

userRouter.get("/", async (req, res) => {
    try{
        const users = await User.find({});
        return res.send({users});
    }
    catch(e){
        console.log(e);
        return res.status(500).send({e: e.message});
    }
});

userRouter.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({ e: "Invalid User ID" });
        const user = await User.findOne({ _id: userId });
        return res.send({ user });
    }
    catch(e){
        console.log(e);
        return res.status(500).send({e: e.message});
    }
});

userRouter.post("/", async (req, res) => {
    try{
        let {username, name} = req.body;
        if(!username) return res.status(400).send({e: "username is required"});
        if(!name || !name.first || !name.last) return res.status(400).send({e: "Both first and last names are required"});
        const user = new User(req.body);
        await user.save();
        return res.send({user});
    }
    catch(e){
        console.log(e);
        return res.status(500).send({e: e.message});
    }
});

userRouter.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({ e: "Invalid User ID" });
        const user = await User.findOneAndDelete({ _id: userId });
        return res.send({ user });
    }
    catch(e){
        console.log(e);
        return res.status(500).send({e: e.message});
    }
});

userRouter.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({e: "Invalid User ID"});

        const { age, name } = req.body;
        if(!age && !name) res.status(400).send({e: "Age or Name is required"});
        if(age && typeof age !== "number") return res.status(400).send({e: "Age must be a number"});
        if(name && typeof name.first !== "string" && typeof name.last !== "string") return res.status(400).send({e: "First and Last name are String"});

        //let updateBody = {};
        //if(age) updateBody.age = age;
        //if(name) updateBody.name = name;
        //const user = await User.findByIdAndUpdate(userId, updateBody, { new: true });

        let user = await User.findById(userId);
        console.log({ userBeforeEdit: user });
        if(age) user.age = age;
        if(name) user.name = name;
        console.log({ userAfterEdit: user });
        await user.save();

        return res.send({ user });
    }
    catch(e){
        console.log(e);
        return res.status(500).send({e: e.message});
    }
});

module.exports = {
    userRouter
}
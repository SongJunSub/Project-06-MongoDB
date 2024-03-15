const { Router } = require("express");
const userRouter = Router();
const mongoose = require("mongoose");
const {User, Blog, Comment} = require("../models");

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

        if(!mongoose.isValidObjectId(userId))
            return res.status(400).send({ e: "Invalid User ID" });

        const [user] = await Promise.all([
            User.findOneAndDelete({_id: userId}),
            Blog.deleteMany({"user._id": userId}),
            Blog.updateMany({"comments.user": userId}, {$pull: {comments: {user: userId}}}),
            Comment.deleteMany({user: userId})
        ])

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

        let user = await User.findById(userId);

        if(age) user.age = age;
        if(name){
            user.name = name;
            await Promise.all([
                Blog.updateMany({"user._id": userId}, {"user.name": name}),
                Blog.updateOne(
                    {},
                    {"comments.$[comment].userFullName": `${name.first} ${name.last}`},
                    {arrayFilters: [{"comment.user": userId}]}
                )
            ])
        }

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
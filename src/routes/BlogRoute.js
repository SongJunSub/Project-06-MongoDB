const { Router } = require("express");
const BlogRouter = Router();
const { User, Blog } = require("../models");
const { isValidObjectId } = require("mongoose");
const { CommentRouter } = require("./CommentRoute");

BlogRouter.use("/:blogId/comment", CommentRouter);

BlogRouter.post("/", async (req, res) => {
    try {
        const { title, content, islive, userId } = req.body;

        if(typeof title !== "string")
            res.status(400).send({err: "title is required"});
        if(typeof content !== "string")
            res.status(400).send({err: "content is required"});
        if(islive && typeof islive !== "boolean")
            res.status(400).send({err: "islive must be a boolean"});
        if(!isValidObjectId(userId))
            return res.status(400).send({err: "userId is invalid"});

        let user = await User.findById(userId);

        if(!user)
            res.status(400).send({err: "User does not exist"});

        let blog = new Blog({ ...req.body, user });

        await blog.save();

        return res.send({ blog });
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: err.message });
    }
});

BlogRouter.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find().limit(200).populate([
            { path: "user" },
            { path: "comments", populate: {path: "user"} }
        ]);

        return res.send({ blogs });
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: err.message });
    }
});

BlogRouter.get("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;

        if(!isValidObjectId(blogId))
            res.status(400).send({ err: "blogId is invalid"});

        const blog = await Blog.find({ _id: blogId });

        return res.send({ blog });
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: err.message });
    }
});

//put : 전체적인 걸 수정할 때
BlogRouter.put("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;

        if(!isValidObjectId(blogId))
            res.status(400).send({ err: "blogId is invalid"});

        const { title, content } = req.body;

        if(typeof title !== "string")
            res.status(400).send({err: "title is required"});
        if(typeof content !== "string")
            res.status(400).send({err: "content is required"});

        const blog = await Blog.findOneAndUpdate(
            { _id: blogId },
            { title, content },
            { new: true }
        );

        return res.send({ blog });
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: err.message });
    }
});

//patch : 특정 부분 수정할 때
BlogRouter.patch("/:blogId/live", async (req, res) => {
    try {
        const { blogId } = req.params;

        if(!isValidObjectId(blogId))
            res.status(400).send({ err: "blogId is invalid"});

        const { islive } = req.body;

        if(typeof islive !== "boolean")
            res.status(400).send({ err: "boolean islive is required"});

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { islive },
            { new: true }
        )

        return res.send({ blog });
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: err.message });
    }
});

module.exports = {
    BlogRouter
}
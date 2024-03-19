const { Router } = require("express");
const CommentRouter = Router({ mergeParams: true });
const { User, Blog, Comment } = require("../models");
const { isValidObjectId, startSession } = require("mongoose");

CommentRouter.post("/", async (req, res) => {

    //const session = await startSession();
    let comment;

    try {
        //await session.withTransaction(async () => {
            const {blogId} = req.params;
            const {content, userId} = req.body;

            if(!isValidObjectId(blogId))
                return res.status(400).send({err: "blogId is invalid"});
            if(!isValidObjectId(userId))
                return res.status(400).send({err: "userId is invalid"});
            if(typeof content !== "string")
                return res.status(400).send({err: "content is required"});

            const [blog, user] = await Promise.all([
                // Blog.findById(blogId, {}, {session}),
                // User.findById(userId, {}, {session})
                Blog.findById(blogId),
                User.findById(userId)
            ]);

            if(!blog || !user)
                return res.status(400).send({ err: "blog or user does not exist" });
            if(!blog.islive)
                return res.status(400).send({ err: "blog is not available" });

            comment = new Comment({
                content,
                user,
                userFullName: `${user.name.first} ${user.name.last}`,
                blog: blogId
            });

            //문제가 있을 때, 기존 Transaction 전체 취소
            //await session.abortTransaction();

            // await Promise.all([
            //     await comment.save(),
            //     await Blog.updateOne({_id: blogId}, {$push: {comments: comment}})
            // ]);

            // blog.commentsCount++;
            // blog.comments.push(comment);
            //
            // if(blog.commentsCount > 1)
            //     blog.comments.shift();
            //
            // await Promise.all([
            //     //comment.save({session}),
            //     comment.save(),
            //     //위에 이미 blog session을 불러왔기 때문에 session을 다시 저장할 필요가 없다.
            //     blog.save()
            //     //await Blog.updateOne({_id: blogId}, {$inc: {commentsCount: 1}})
            // ]);
        //})

        //$slice: -3 : 제일 최근에 push된 애들을 살리고 나머지는 버린다.
        await Promise.all([
            comment.save(),
            Blog.updateOne({_id: blogId}, {$inc: {commentsCount: 1}, $push: {comments: {$each: [comment], $slice: -3}}})
        ])

        return res.send({comment});
    }
    catch (err){
        return res.status(400).send({
            err: err.message
        });
    }
    finally {
        //await session.endSession();
    }

})

CommentRouter.get("/", async (req, res) => {
    let {page} = req.query;
    page = parseInt(page);

    const { blogId } = req.params;

    if(!isValidObjectId(blogId))
        return res.status(400).send({err: "blogId is invalid"});

    const comments = await Comment.find({ blog: blogId })
        .sort({createdAt: -1})
        .skip(page * 3)
        .limit(3);

    return res.send({ comments });
})

CommentRouter.patch("/:commentId", async (req, res) => {
   const {commentId} = req.params;
   const {content} = req.body;

   if(typeof content !== "string")
       return res.status(400).send({err: "content is required"});

   const [comment] = await Promise.all([
       Comment.findOneAndUpdate(
           {_id: commentId},
           {content},
           {new: true}
       ),
       Blog.updateOne(
           {"comments._id": commentId},
           {"comments.$.content": content}
       )
   ]);

   return res.send({comment});
});

CommentRouter.delete("/:commentId", async (req, res) => {
    const {commentId} = req.params;

    const comment = await Comment.findOneAndDelete({_id: commentId});

    await Blog.updateOne({"comments._id": commentId}, {$pull: {comments: {_id: commentId}}});
    // await Blog.updateOne(
    //     {"comments._id": commentId},
    //     {$pull: {comments: {$elemMatch:{ content: "hello", state: true}}}}
    // );

    return res.send({comment});
})

module.exports = {
    CommentRouter
}
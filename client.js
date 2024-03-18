console.log("Client code running");
const axios = require("axios");

const URL = "http://localhost:3000";

//N+1 문제 발생 코드
/*const test = async () => {

    console.time("Loading time : ");

    let { data: { blogs } } = await axios.get(`${URL}/blog`);

    blogs = await Promise.all(blogs.map(async blog => {
        const [ mappedUser, mappedComments ] = await Promise.all([
            await axios.get(`${URL}/user/${blog.user}`),
            await axios.get(`${URL}/blog/${blog._id}/comment`)
        ])

        blog.user = mappedUser.data.user;
        blog.comments = await Promise.all(mappedComments.data.comments.map((async comment => {
            const { data: { user } } = await axios.get(`${URL}/user/${comment.user}`)

            comment.user = user;

            return comment;
        })));

        return blog;
    }));

    console.timeEnd("Loading time : ");

}*/

//populate를 이용한 N+1 문제 해결
const test = async () => {

    console.time("Loading time");

    let { data: { blogs } } = await axios.get(`${URL}/blog`);

    //console.log(blogs);

    console.timeEnd("Loading time");

}

//test();

const testGroup = async () => {

    await test();
    await test();
    await test();
    await test();
    await test();
    await test();
    await test();
    await test();

}

testGroup();
const express=require('express');
const app=express();
require('dotenv').config()
const nodemailer=require('nodemailer');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
const cors=require('cors');

const bcrypt=require('bcrypt');
const mysql=require('mysql2');
app.use(cors());
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'996644',
    database:'dairy'
});

connection.connect((err)=>{
    if(err){
        console.log(err);
    }
    console.log("db connected");
})


app.listen(8081,()=>{
    console.log('server running...');
})


app.get('/',(request,response)=>{
    response.send('created');
    response.status(200);
})

app.post('/registerUser', async (req, res) => {
    console.log(req.body);

    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        const hashedPass = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (email, hashedPass) VALUES (?, ?)";

        connection.query(sql, [email, hashedPass], (err, result) => {
            if (err) {
                console.log(err);

                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send("Email already exists");
                }

                return res.status(400).send("registration unsuccessful");
            }

            return res.status(200).send("registration successful");
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("server error");
    }
});



app.post('/loginUser', async (req, res) => {
    console.log(req.body);

    const { email, password } = req.body;

    const sql = "SELECT id, email, hashedPass FROM users WHERE email = ?";

    connection.query(sql, [email], async (err, result) => {

        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).send("database error");
        }

        
        if (result.length === 0) {
            return res.status(404).send("user not exists please register");
        }

        console.log("result:", result);

        const storedHash = result[0].hashedPass;
        const userId=result[0].id;
        const isPasswordCorrect = await bcrypt.compare(password, storedHash);

        if (!isPasswordCorrect) {
            return res.status(401).send("invalid password");
        }

        // 🟢 SUCCESS
        return res.status(200).json({userId:userId});
    });
});


app.post('/newPost',async (req, res) => {
    const { userId, postTitle, postDescription } = req.body;

    console.log("REQ BODY:", req.body);

    if (!userId) {
        return res.status(401).send("login required");
    }
   if (!postTitle || !postDescription || 
        postTitle.trim().length === 0 || 
        postDescription.trim().length === 0) {
        return res.status(400).send("do not leave empty");
    }
    const sql = `
        INSERT INTO posts (userId, postTitle, postDescription)
        VALUES (?, ?, ?)
    `;

    connection.query(
        sql,
        [userId, postTitle, postDescription],
        (err, result) => {
            if (err) {
                console.log("DB ERROR:", err);
                return res.status(500).send("post creation failed");
            }

            return res.status(200).json({
                message: "post created successfully",
                postId: result.insertId
            });
        }
    )
});



app.get('/getPosts/:userId', (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT id, postTitle, postDescription
        FROM posts
        WHERE userId = ?
        ORDER BY id DESC
    `;

    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send("failed to fetch posts");
        }

        return res.status(200).json(results);
    });
});


//get post

app.get('/getPost/:userId/:postId',async (request,response)=>{
    const {userId,postId}=request.params;
    console.log('inside view post',request.params);
    const sqlQuery=`select postTitle,postDescription from posts where userId=${userId} and Id=${postId}`;

    connection.query(sqlQuery,(err,result)=>{
        if(err){
            return response.status(400).send("post not found");
        }
        console.log(result);
        return response.status(200).send(result[0]);
    })
})


app.delete('/deletePost/:postId',async (request,response)=>{
    const {postId}=request.params;
    console.log(postId);
    const sql=`delete from posts where id=${postId}`;
    connection.query(sql,(err,res)=>{
        if(err){
            console.log(err);
            return response.status(500).send("failed to delete");
        }
        return response.status(200).json({message:"post deleted"});
    })
});



app.put('/updatePost/:userId/:postId',async (request,response)=>{
    const {userId,postId}=request.params;
    const {postTitle,postDescription}=request.body;

    const sql=`update posts set postTitle=?,postDescription=? where id=? and userId=?`;
    connection.query(sql,[postTitle,postDescription,postId,userId],(err,result)=>{
        if(err){
            return response.status(400).send('update failed');
        }

        if(result.affectedRows===0){
            return response.status(404).send('post not found');
        }
        return response.status(200).json({
            message:'post updated succesfully'
        })

    });

})



//mailer setup


const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        // user:'swargamyaswanth106@gmail.com',
        // pass:'invzfjxagklbphri'
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS
    }
});
// send mail

app.post('/sendMail/:postId', async (req, res) => {
  const { userId} = req.body;
  const {postId}=req.params;

  const sql = `SELECT email FROM users WHERE id = ?`;

  connection.query(sql, [userId], async (err, result) => {
    if (err) {
      return res.status(400).json({ success: false, message: "DB error" });
    }

    if (!result.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const toMail = result[0].email;

    const sql2=`select postTitle,postDescription from posts where id=?`;
    connection.query(sql2,[postId],async (err,res2)=>{
        if(err){
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const postTitle=res2[0].postTitle;
        const postDescription=res2[0].postDescription;


        try {
      await transporter.sendMail({
        //from: "swargamyaswanth106@gmail.com",
        from: process.env.MAIL_USER,
        to: toMail,
        subject: postTitle,
        text: postDescription,
      });

      return res.json({ success: true, message: "Email sent!" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ success: false, message: e.message });
    }

    })
    
  });
});

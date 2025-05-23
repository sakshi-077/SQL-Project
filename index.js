const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app=express();
const path = require("path");
const {v4:uuidv4} = require('uuid');
const methodOverride = require("method-override");

let id = uuidv4();
app.use (express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password : 'QWERTY0987',
});
let getRandomUser = ()=>{
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),   
    faker.internet.password(),
  ];
}

//home route
app.get("/",(req,res)=>{
  let q=`select count(*) from user`;
  try{
  connection.query(q,(err,result)=>{
    if (err) throw err;
    let count = result[0]['count(*)'];
    res.render("home.ejs",{count});
  })
  }catch(err){
    console.log(err);
    res.send("some err in db");
  }
})

//show route
app.get("/user",(req,res)=>{
  let q = `select * from user`;
  try{
  connection.query(q,(err,users)=>{
    if (err) throw err;
    
    res.render("show.ejs",{users});
  })
  }catch(err){
    console.log(err);
    res.send("some err in db");
  } 
})

//edit route
app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let q = `select * from user where id='${id}' `;
  try{
  connection.query(q,(err,result)=>{
    if (err) throw err;
    let user = result[0];
    res.render("form.ejs",{user});
  })
  }catch(err){
    console.log(err);
    res.send("some err in db");
  }  
})

//update route
app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;
  let {password:formPass , username:newUsername} =req.body;
  let q = `select * from user where id='${id}' `;

  try{
  connection.query(q,(err,result)=>{
    if (err) throw err;
    let user=result[0];
    if(formPass != user.password){
      res.send("wrong password");
    }else{
      let q2 = `update user set username = '${newUsername}' where id='${id}' `
      connection.query(q2,(err,result)=>{
        if(err) throw err;
        res.redirect('/user');
      })
    }
    
  })
  }catch(err){
    console.log(err);
    res.send("some err in db");
  }  
  
})


app.get("/user/newUser" , (req,res)=>{
  res.render("add.ejs");
  
})
app.post("/user",(req,res)=>{
  let q = req.body;
  let q3 = `insert into user (id,username,email,password) values ( '${id}','${q.username}','${q.email}','${q.password}')`
  try{
  connection.query(q3,(err,result)=>{
    if (err) throw err;
    res.redirect('/user');
    // let user = result[0];
    // res.render("form.ejs",{user});
  })
  }catch(err){
    console.log(err);
    res.send("some err in db");
  }  
})
app.get('/user/:id/delUser',(req,res)=>{
  let {id} = req.params;
  res.render('delete.ejs', {id})
})

app.delete('/user/:id' , (req,res)=>{
  // let q = req.body;
  // console.log(q);
  // res.send("deleting");
  let {id} = req.params;
  let {email:newEmail ,password:formPass} =req.body;
  let q = `select * from user where id='${id}' `;
  try{
  connection.query(q,(err,result)=>{
    if (err) throw err;
    let user=result[0];
    if(formPass != user.password || newEmail != user.email ){
      res.send("either wrong password or email");
    }else{
      let q2 = `delete from user where '${id}' = id `;
      connection.query(q2,(err,result)=>{
        if(err) throw err;
        res.redirect('/user');
      })
    }
  })
  }catch(err){
    console.log(err);
    res.send("some err in db");
  } 
})

const port = 8080;
app.listen(port,(req,res)=>{
  console.log("listening to port:8080")
})

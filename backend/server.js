import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import sessions from  'express-session';
import Task from "./models/Task.js"
import cors from 'cors';


dotenv.config();

connectDB();

const port = process.env.PORT;
console.log(port);


const app = express();



// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

app.use(cors());
//session middleware
app.use(sessions({
    secret: "thisismysecrctekey",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));


//middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
   res.send("Hii I am working");
})
app.get("/getalltasks",(req,res)=>{
  console.log(req.session.email);

  if(!req.session.email)
  {
     return  res.json({
       "status" : false,
       "message": "session expired"
    });
  }
    async function getAllData(){
      console.log("Started");

      let user = await User.findOne({email:req.session.email});
       
      let result = await Task.find({user_id:user._id});
      console.log(result);

      res.json({
         "status":true,
         "data": result,
      })
    }
    getAllData();
})




app.post("/login",(req,res)=>{
     
    console.log("starting" + req.session.email);
    var hashing = async () => {
          console.log("password  " + req.body.password);
          var new_user = {
           email : req.body.email,
           password : req.body.password
        };
        
        var data_found = await User.find(new_user);
        console.log(data_found);
        
        if(data_found)
        {  
            console.log("data found" + data_found[0].email);
            req.session.email = data_found[0].email;
            console.log(req.session);
            console.log("session:" + req.session.email)
             var  data  = await Task.find({user_id: data_found[0]._id});
             
            
              return  res.send({
                        "status":true,
                        "message":"Successfully Login",
                        "data": data,
                        })
                    }
        else{
          return res.send({
           "status": false,
           "message":"Email and password are not matching"
         })
        }
    }
    hashing();
})

app.post("/signup",(req ,res) => {

   let name = req.body.name;
   let email = req.body.email;
   // let hash = "";

   console.log("signup" + req.body.password);

   let hashing =  async () => {

      try{
       let newUser = new User({
         name,
         email,
         "password": req.body.password,
       });
      var response = await  newUser.save();
      return res.json({
          "message" : "Successfully created account"
      });
    }
    catch(error){
        return res.json({
           "status": false,
           "message": "You have already an account",
        })
    }
};  

hashing();
})



app.post("/addtask",(req,res)=>{

  console.log(req.session.email);

  if(!req.session.email)
  {
     return  res.json({
       "status" : false,
       "message": "session expired"
    });
  }
    async function addTask(){
           var email = req.session.email;
           var user = await User.findOne({email});
           var task = {
                "user_id": user._id,
                "task":  req.body.task
           }
           var addedTask  =   await Task(task).save();
           res.send({
             "status": true,
             "data" : addedTask,
             "message": "stored successfully"
           })
         }
    addTask();
})






app.put("/editdata",(req,res)=>{
  console.log("hello");
  if(!req.session.email)
  {
     return  res.json({
       "status" : false,
       "message": "session expired"
    });
  }
  console.log("world")
  console.log(req.body);
  async function editData(){
       console.log(req.body);
       var email = req.session.email;
       console.log(email);
       var user  = await  User.findOne({email});
       console.log("user"+user);
       var _id = new mongoose.Types.ObjectId(req.body.id);
       console.log({user_id:user._id,_id});
       var result = await Task.findOneAndUpdate({user_id:user._id,_id},{task:req.body.task});

       console.log(result);
       var modified_data = await Task.find({user_id:user._id,_id:req.body.id});
       return  res.json({
           status : true,
           modified_data,
       }
       )
  }   
  editData();
});

app.delete("/removetask/:id",(req,res)=>{
    console.log("remove task");
    if(!req.session.email)
    {
      return  res.json({
        "status" : false,
        "message": "session expired"
      });
    }

    async function RemoveTask(){
       console.log("executing remove task");
       let email = req.session.email;
       let user = await User.findOne({email});
      
       console.log("ID:",req.query,req.params);
       console.log({user_id:user._id,_id:req.params.id});
       var allTasks = await Task.find({});
       console.log("All TaSks")
       console.log(allTasks);
      const result  = await Task.deleteOne({_id:req.params.id});
       return res.json({
        "status": true,
        "message": "successfully deleted",
       });
    }

    RemoveTask();
  
});
app.delete("/removeall",(req,res)=>{
  console.log("remove all");
  if(!req.session.email)
  {
    return  res.json({
      "status" : false,
      "message": "session expired"
    });
  }
  async function removeAll(){
        
       let user = await User.findOne({email:req.session.email}); 
       let result = await Task.deleteMany({user_id:user._id})
       console.log(result);
       return res.json({
        "status":true,
        "message": "Successfully deleted All",
       })
  }
  removeAll();
})

app.listen(port,"0.0.0.0",()=>{
    console.log(`[server] Server started @${port}`)
})


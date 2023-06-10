import express from "express";
const app = express();
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import sessions from 'express-session';
import Task from "./models/Task.js"
import cors from 'cors';
import path from 'path';

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessions({                //session middleware
    secret: "thisismysecrctekey",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}));

// Config
dotenv.config();
connectDB();

// Constants
const port = process.env.PORT;

// routes
app.get("/getalltasks", (req, res) => {
    if (!req.session.email) {
        return res.json({
            "status": false,
            "message": "session expired"
        });
    }

    async function getAllData() {
        let user = await User.findOne({ email: req.session.email });
        let result = await Task.find({ user_id: user._id });
        res.json({
            "status": true,
            "data": result,
        })
    }
    getAllData();
});

app.post("/login", (req, res) => {
    var hashing = async () => {
        var new_user = {
            email: req.body.email,
            password: req.body.password
        };

        var data_found = await User.find(new_user);

        if (data_found) {
            console.log("data found" + data_found[0].email);
            req.session.email = data_found[0].email;
            console.log(req.session);
            console.log("session:" + req.session.email)
            var data = await Task.find({ user_id: data_found[0]._id });


            return res.send({
                "status": true,
                "message": "Successfully Login",
                "data": data,
            })
        }
        else {
            return res.send({
                "status": false,
                "message": "Email and password are not matching"
            })
        }
    }
    hashing();
})

app.post("/signup", (req, res) => {

    let name = req.body.name;
    let email = req.body.email;

    let hashing = async () => {
        try {
            let newUser = new User({
                name,
                email,
                "password": req.body.password,
            });
            var response = await newUser.save();
            return res.json({
                "message": "Successfully created account"
            });
        }
        catch (error) {
            return res.json({
                "status": false,
                "message": "You have already an account",
            })
        }
    };

    hashing();
})


app.post("/addtask", (req, res) => {
    if (!req.session.email) {
        return res.json({
            "status": false,
            "message": "session expired"
        });
    }

    async function addTask() {
        var email = req.session.email;
        var user = await User.findOne({ email });
        var task = {
            "user_id": user._id,
            "task": req.body.task
        }
        var addedTask = await Task(task).save();
        res.send({
            "status": true,
            "data": addedTask,
            "message": "stored successfully"
        })
    }
    addTask();
});

app.put("/editdata", (req, res) => {
    if (!req.session.email) {
        return res.json({
            "status": false,
            "message": "session expired"
        });
    }
    async function editData() {
        var email = req.session.email;
        var user = await User.findOne({ email });
        var _id = new mongoose.Types.ObjectId(req.body.id);
        var result = await Task.findOneAndUpdate({ user_id: user._id, _id }, { task: req.body.task });
        var modified_data = await Task.find({ user_id: user._id, _id: req.body.id });
        return res.json({
            status: true,
            modified_data,
        })
    }
    editData();
});

app.delete("/removetask/:id", (req, res) => {
    if (!req.session.email) {
        return res.json({
            "status": false,
            "message": "session expired"
        });
    }

    async function RemoveTask() {
        let email = req.session.email;
        let user = await User.findOne({ email });
        var allTasks = await Task.find({});
        const result = await Task.deleteOne({ _id: req.params.id });
        return res.json({
            "status": true,
            "message": "successfully deleted",
        });
    }
    RemoveTask();

});
app.delete("/removeall", (req, res) => {
    if (!req.session.email) {
        return res.json({
            "status": false,
            "message": "session expired"
        });
    }
    async function removeAll() {
        let user = await User.findOne({ email: req.session.email });
        let result = await Task.deleteMany({ user_id: user._id })
        return res.json({
            "status": true,
            "message": "Successfully deleted All",
        })
    }
    removeAll();
})
app.use(express.static('./build'));
app.get('*', (req, res) => res.sendFile('build/index.html', { root: './' }));

app.listen(port, () => console.log(`[server] server running @${port}`));
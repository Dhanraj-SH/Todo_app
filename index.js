require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");
const {userModel, todoModel} = require("./models");

const app = express();
app.use(express.json());

// let USER_ID = 1;
// let TODO_ID = 1;

// let USERS = [];
// let TODOS = [];

app.post("/signup", async(req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    // const userExists = USERS.find(user => user.username === username);

    const userExists = await userModel.findOne({
        username: username,
    })

    if(userExists){
        return res.status(403).json({
            message: "User username already exists"
        });
    }

    // USERS.push({
    //     id: USER_ID++,
    //     username: username,
    //     password: password
    // });

    const newUser = await userModel.create({
        username: username,
        password: password
    });

    res.json({
        id: newUser._id
    })
});

app.post("/signin", async(req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    // const userExists = USERS.find(u => u.username === username && u.password === password);

    const userExists = await userModel.findOne({
        username: username,
        password: password
    });

    if(!userExists){
        return res.status(403).json({
            message: "User have not signed up"
        });
    }

    const token = jwt.sign({
        userId: userExists.id
    }, process.env.JWT_SECRET);

    res.json({
        token: token
    });

});

app.post("/todo", authMiddleware, async (req,res)=>{
    const userId = req.userId;
    const title = req.body.title;
    const description = req.body.description;

    const newTodo = await todoModel.create({
        title: title,
        description: description,
        userId: userId
    });

    // TODOS.push({
    //     id: TODO_ID++,
    //     title: title,
    //     description: description,
    //     userId: userId
    // });

    res.json({
        todoid: newTodo._id
    });
});

app.delete("/todo/:todoId", authMiddleware, async (req,res)=>{
    const userId = req.userId;
    const todoId = req.params.todoId;

    // const ownsTodo = TODOS.find(todo => todo.id === todoId && todo.userId === userId);

    const deleteTodo = await todoModel.findOneAndDelete({
        _id: todoId,
        userId: userId
    });

    if(!deleteTodo){
        return res.status(411).json({
            message: "Either todo doesnt exist or this is not your todo"
        });
    }

    res.json({
        message: "Todo deleted"
    });
});

app.get("/todos", authMiddleware, async (req, res)=>{
    const userId = req.userId;
    const todosList = await todoModel.find({
        userId: userId
    });

    res.json({
        todos: todosList
    });
});

app.listen(process.env.PORT);

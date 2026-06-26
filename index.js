require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");
const {userModel, todoModel} = require("./models");
const z = require("zod");

const app = express();
app.use(express.json());

// let USER_ID = 1;
// let TODO_ID = 1;

// let USERS = [];
// let TODOS = [];

const signupSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
});

const signinSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
});

const todoSchema = z.object({
    title: z.string().min(5).max(20),
    description: z.string().min(10).max(50)
});

app.post("/signup", async(req, res)=>{
    
    const {data, success, error} = signupSchema.safeParse(req.body);

    if(!success){
        return res.status(400).json({
            message: "Incorrect credentails",
            error: error.issues
        });
    }

    const {username, password} = data;

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        username: username,
        password: hashedPassword
    });

    res.json({
        id: newUser._id
    })
});

app.post("/signin", async(req, res)=>{

    const {data, success, error} = signinSchema.safeParse(req.body);

    if(!success){
        return res.status(400).json({
            message: "Inncorect credentails",
            error: error.issues
        });
    }

    const {username, password} = data;
    
    // const userExists = USERS.find(u => u.username === username && u.password === password);
    
    const userExists = await userModel.findOne({
        username: username,
    });

    if(!userExists){
        return res.status(403).json({
            message: "User have not signed up"
        });
    }

    const correctPassword = await bcrypt.compare(password, userExists.password);

    if(!correctPassword){
        return res.status(403).json({
            message: "Incorret password"
        });
    }

    const token = jwt.sign({
        userId: userExists._id
    }, process.env.JWT_SECRET);

    res.json({
        token: token
    });

});

app.post("/todo", authMiddleware, async (req,res)=>{
    const userId = req.userId;

    const {data, success, error} = todoSchema.safeParse(req.body);

    if(!success){
        return res.status(400).json({
            message:"Incorrect data",
            error: error.issues
        });
    }

    const {title, description} = data;

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
        todoId: newTodo._id
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

require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String
});

const todoSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId:{
        type: mongoose.Types.ObjectId,
        ref: "users" 
    } 
        
});

const userModel = mongoose.model("users", userSchema);
const todoModel = mongoose.model("todos", todoSchema);

module.exports = {
    userModel: userModel,
    todoModel: todoModel
}
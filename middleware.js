require("dotenv").config();
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next){
    const token = req.headers.token;

    if(!token){
        return res.status(403).json({
            message: "You have not logged in "
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.userId){
        req.userId = decoded.userId;
        next();
    }else{
        return res.status(403).json({
            message: "Token is invalid"
        });
    }

}

module.exports = {
    authMiddleware: authMiddleware
}
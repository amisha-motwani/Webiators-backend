const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

//middleware req, res, next as a parameter leta hai, next means next function call hoga (jaha ye middleware call kara hai vo function execute hoga)

const fetchuser = (req, res, next) => {
    //get the user from the JWT token and add id to req object

    // here we will send token from req header and name it as "auth-token"
    const token = req.header("auth-token");
    
    if(!token){
        res.status(401).send({
            error:"Please authenticate using a valid token"
        })
    }
    try{
        //here we will extract id from auth token
        const data = jwt.verify(token, JWT_SECRET );
        req.user = data.user;
        next();

    } catch(error){
        res.status(401).send({
            error:"Please authenticate using a valid token"
        })
    }
}


module.exports = fetchuser;

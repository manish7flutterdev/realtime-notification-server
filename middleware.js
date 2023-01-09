const jwt = require("jsonwebtoken")
const config = require("./config")
const { statusCode } = require('./constants')


const checkToken = (req,res,next) =>{
    let token = req.headers["authorization"]
    
    if(token!=null)
    {
        token = token.slice(7,token.length)
        jwt.verify(token,config.key,(err,decoded)=>{
            if(err)
            {
                return res.json({
                    status:statusCode.STATUS_WARNING,
                    msg:"token is invalid"
                })
            }
            else
            {
                req.decoded = decoded
                next()
            }
        })
    }
    else
    {
        return res.json({
            status:statusCode.STATUS_WARNING,
            msg:"Token is not Provided"
        })
    }
}


module.exports = {
    checkToken:checkToken
}
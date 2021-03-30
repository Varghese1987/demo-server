const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const JWT_SECRET = "1234";


const hashing = (value)=>{
    return new Promise((resolve,reject)=>{
        bcrypt.genSalt(10,(err,salt)=>{
            if(err){
                reject({
                    message:"Somenting went wrong --> inside hashing"
                })
            }
            bcrypt.hash(value,salt,(err,passwordHash)=>{
                if(err){
                    reject({
                        message:"Somenting went wrong --> inside hashing"
                    })
                }
                resolve(passwordHash)
            })
        })
    })
}

const hashCompare = (value,hashValue)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            const bcryptValue = await bcrypt.compare(value,hashValue)
            resolve(bcryptValue)
        } catch (error) {
            reject(error)
        }
    })
}

const createJWT = async ({email,id,role})=>{
    return await JWT.sign(
        {email,id,role},
        JWT_SECRET,
        {
            expiresIn:"24h"
        }
    )
}

const authenticate = async (req,res,next)=>{
    try {
        const headerToken = await req.headers["authorization"];
        if(!headerToken){
            return res.sendStatus(403)
        }
        const bearer = headerToken.split(" ");
        const bearerToken = bearer[0];
        if(!bearerToken){
            return res.sendStatus(403);
        }
        JWT.verify(bearerToken,JWT_SECRET, (err,decoded)=>{
            if(err){
                return res.sendStatus(401)
            }
            if(decoded){
                const auth = decoded;
                req.body.auth = auth;
                next();
            }
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(401)
    }
}

module.exports={hashing, hashCompare, createJWT, authenticate};
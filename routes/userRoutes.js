import express from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { client } from "../index.js";
const router=express.Router();

async function genHashedPassword(password){      //generating hashed password
    const NO_OF_ROUNDS=10;
    const salt=await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword= await bcrypt.hash(password,salt);
    return hashedPassword;
}
router.post("/register", async function (request, response) {     //users sign up and authorization
    const {username,email,password,confirmPassword}=request.body;
    const userFromDB= await client.db("webchat-app")
    .collection("register")
    .findOne({username: username});
    if(userFromDB){
       response.status(400).send({msg:"User already exists"});
    } else{
       const hashedPassword= await genHashedPassword(password);
       console.log(hashedPassword);
       const result= await client.db("webchat-app")
       .collection("register")
       .insertOne({username: username, email:email,password:hashedPassword});
       response.send(result);
    }
   });
   router.post("/login", async function (request, response) {       //checking for authentication and user login
    const {username,email,password,confirmPassword}=request.body;
       const userFromDB= await client.db("webchat-app")
       .collection("register")
       .findOne({username: username});
       if(!userFromDB){
          response.status(401).send({msg:"Invalid Credentials"});
       } else{
        const storePassword= userFromDB.password;
        const isPasswordMatch=await bcrypt.compare(password,storePassword);
        console.log(isPasswordMatch);
   
        if(isPasswordMatch){
          const token=jwt.sign({id:userFromDB._id},`${process.env.SECRET_KEY}`);
          await client.db("webchat-app")
          .collection("session")
          .insertOne({username:userFromDB.username,userId: userFromDB._id, token:token,});
             
             response.send({msg:"Successful Login", token:token, username:userFromDB.username});
           }
       else{
           response.status(401).send({msg:"Invalid credentials"});
        }
       }
      });

export const userRoutes= router;
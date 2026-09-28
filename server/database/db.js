
import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config();


const connecTtoDB = async() =>{
    try{
    await mongoose.connect(
            process.env.MONGO_URI

       
      );
      
    console.log(' mongodb connect successfully ');
    }catch(error){
        console.log('mongodb connection failed' ,error);
        process.exit(1);
    }

};
export default connecTtoDB;  
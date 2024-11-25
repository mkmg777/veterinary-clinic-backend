import mongoose from "mongoose";

const configureDb=async()=>{
    try{
        const db=await mongoose.connect(process.env.DB_URL)
        console.log('connected to Db',db.connections[0].name)
    }catch(err){
        console.log('error connecting to DB',err)
    }
}

export default configureDb
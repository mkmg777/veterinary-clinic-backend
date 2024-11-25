import { Schema,model } from "mongoose";

const userSchema=new Schema({
    name:{
        type: String,
        required: true,
      },
    email:{
        type: String,
        required: true,
        unique: true,
      },
    password:{
        type: String,
        required: true,
      },
    role:{
        type:String,
        default:'customer',
        enum:['admin','employee','customer']
    },
    position:String,
    resetToken: {
        type: String,  // Token for resetting password
      },
      resetTokenExpiration: {
        type: Date,  // Expiration time for the reset token
      },
      passwordChangedAt: {
        type: Date,  // Track when the password was last changed
      }
},{timestamps:true})

const User=model('User',userSchema)
export default User
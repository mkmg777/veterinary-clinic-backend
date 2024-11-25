import { Schema,model } from "mongoose"

const counterSchema=new Schema({
    date:{type:Date,required:true,unique:true},
    count:{type:Number,default:1}
},{timestamps:true})

const AppointmentCounter=model('AppointmentCounter',counterSchema)
export default AppointmentCounter
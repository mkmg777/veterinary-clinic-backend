import { Schema,model } from "mongoose";

const appointmentSchema=new Schema({
    patient:{type:Schema.Types.ObjectId,ref:'Patient',required:true},
    date:{type:Date,required:true},
    reason:{type:String,required:true},
    status:{type:String,enum:['scheduled','completed','cancelled'],default:'scheduled'},
    time:{type:String,required:true},
    ownerName:{type:String,required:true},
    ownerContact:{type:Number,required:true},
    appointmentNumber:{ type: Number, required: true }
},{timestamps:true})

const Appointment=model('Appointment',appointmentSchema)
export default Appointment
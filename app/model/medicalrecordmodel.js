import { Schema,model } from "mongoose";

const medicalrecordSchema=new Schema({
    patientId:{type:Schema.Types.ObjectId,ref:'Patient',required:true},
    date:{type:Date,required:true},
    diagnosis:String,
    treatment:{type:String,required:true},
    // photo:{type:String,required:true},
    prescription:String,
    nextvisitdate:{type:Date},
    
    
},{timestamps:true})

const MedicalRecord=model('MedicalRecord',medicalrecordSchema)
export default MedicalRecord
import { Schema,model } from "mongoose";

const counterSchema=new Schema({
    sequenceValue: { type: Number, default: 101 }
})

const PatientCounter=model('Counter',counterSchema)

export default PatientCounter
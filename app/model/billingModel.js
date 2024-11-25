import mongoose, { Schema } from "mongoose";

const BillingSchema=new Schema({
    ownerName: {
        type: String,
        required: true,
    },
    patientId:{
        type:Schema.Types.ObjectId,
        ref:'Patient',
        required:true
    },
    medicalRecordId:{
        type:Schema.Types.ObjectId,
        ref:'MedicalRecord',
        required:true
    },
    services:[
        {serviceName:{
            type:String,
            required:true
        },
        cost:{
            type:Number,
            required:true
        }}
    ],
    totalCost:{
        type:Number,
        required:true
    },
    paymentMethod: {
        type: String,
        required: true // Ensure this is required if necessary
    },
    billingDate: { // Changed from billingdate to billingDate
        type: Date,
        default: Date.now // Set default to current date
    }
})

const Billing=mongoose.model('Billing',BillingSchema)
export default Billing
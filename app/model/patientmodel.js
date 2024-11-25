import { Schema,model, trusted } from "mongoose";

const patientSchema=new Schema({
    name:{type:String,required:true},
    species:{type:String,required:true},
    breed:{type:String,required:true},
    age:{type:Number,required:true},
    patientId:{type:String,unique:true,required:true},
    ownerName:{type:String,required:true},
    ownerContact:{type:Number,required:true},
    medicalHistory:[{
        type:Schema.Types.ObjectId,
        ref:'MedicalRecord'
    }]
},{timestamps:true})

// Pre-save hook to generate a patient ID
patientSchema.pre('save', async function(next) {
    // Custom ID generation logic (e.g., "PAT-" + a unique identifier)
    if (!this.patientId) {
        let isUnique = false;
        while (!isUnique) {
            // Generate a custom patient ID (e.g., PAT-XXXX)
            const generatedId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
            // Check if the generated ID is unique
            const existingPatient = await model('Patient').findOne({ patientId: generatedId });
            if (!existingPatient) {
                this.patientId = generatedId;
                isUnique = true;
            }
        }
    }
    next();
});

const Patient=model('Patient',patientSchema)
export default Patient
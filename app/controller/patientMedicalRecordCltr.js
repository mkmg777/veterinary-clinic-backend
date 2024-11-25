import MedicalRecord from "../model/medicalrecordmodel.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Patient from "../model/patientmodel.js";
import Twilio from 'twilio'
import schedule from 'node-schedule';

const patientMedicalRecordCltr={}

patientMedicalRecordCltr.create=async(req,res)=>{
    const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio account SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio auth token
    const client = new Twilio(accountSid, authToken);
    const twilioNumber=process.env.TWILIO_PHONE_NUMBER
   
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        console.log("Validation errors:", errors.array()); // Log validation errors    
        return res.status(400).json({errors:errors.array()})
     }

     try{
        const { patientId,date, diagnosis, treatment, prescription, nextvisitdate } = req.body;
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ errors: 'Patient not found' });
        }
       
        const medicalRecord = new MedicalRecord({
            patientId,
            date: new Date(), // Use the global Date object for current date
            diagnosis,
            treatment,
            prescription,
            nextvisitdate // The next visit date provided by the employee
        })
        await medicalRecord.save()
        if (nextvisitdate) {
            const reminderDate = new Date(nextvisitdate); // Convert the next visit date to a Date object
            reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before the next visit
                   
            // Schedule SMS reminder for 3 days before the next visit
            schedule.scheduleJob(reminderDate, async () => {
                await client.messages.create({
                    body: `Reminder: Your pet's next visit is scheduled for ${new Date(nextvisitdate).toLocaleDateString()}.`,
                    from: +13345818407,
                    to: patient.ownerContact // Assuming patient object contains owner's contact number
                });
                console.log('Reminder SMS sent to:', patient.ownerContact);
            });
        }
        
        patient.medicalHistory.push(medicalRecord._id)
        await patient.save()
        res.status(201).json(medicalRecord)
     }catch(err){
        console.error("Error sending SMS:", error)
        console.log("Error creating medical record:", err)
        res.status(500).json({errors:'medical record not created'})
    }
}

patientMedicalRecordCltr.update=async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id=req.params.id
    const body=req.body
    try {
        const updateMedicalRecord = await MedicalRecord.findByIdAndUpdate(id, body, { new: true });

        if (!updateMedicalRecord) {
            return res.status(404).json({ errorMessage: "Medical record not found" });
        }

        return res.status(200).json(updateMedicalRecord);
    } catch(err){
        console.log("Error updating medical record:", err)
        res.status(500).json({errorMessage: "Internal server error" })
    }
}

patientMedicalRecordCltr.delete=async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id=req.params.id
    try{
        const medicalRecord=await MedicalRecord.findByIdAndDelete(id)
        if (!medicalRecord) {
            return res.status(404).json({ errorMessage: 'Medical record not found' });
        }
        res.status(200).json({message:'medical record deleted successfully',medicalRecord})        
    }catch(err){
        console.log("Error deleting medical record:", err)
        res.status(500).json({ errorMessage: "Internal server error" })
    }
}

patientMedicalRecordCltr.show=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).jsnon({errors:errors.array()})
    }
    const id = req.params.id
    if (!id) {
        return res.status(400).send({ message: "Medical ID is required." });
    }
    try{        
        const medicalrecord = await MedicalRecord.findById(id)
     if (!medicalrecord) {
        return res.status(404).send({ message: "Medical Record not found." });
    }
    res.status(200).json(medicalrecord)
    }catch(err){
        console.error("Error fetching medicalrecord:", err)
        res.status(500).send({ message: "Server error" })
    }

}

patientMedicalRecordCltr.getMedicalRecordAll=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const medicalrecord = await MedicalRecord.find()
        res.status(200).json(medicalrecord)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:errors.array()})
    }
}

 // Assuming you have a Patient model
patientMedicalRecordCltr.getMedicalRecord = async (req, res) => {
    const { medicalId, patientId, ownerContact } = req.query;

    // Ensure at least one of the parameters is provided
    if (!medicalId && !patientId && !ownerContact) {
        return res.status(400).json({ errorMessage: "Either patientId, medicalId, or ownerContact must be provided" });
    }

    try {
        let medicalRecord;
        // Search by medicalId if provided
        if (medicalId) {
            medicalRecord = await MedicalRecord.findById(medicalId);
            if (!record) {
                return res.status(404).json({ errorMessage: "Medical record not found" });
            }
            medicalRecord.push(record);
        }         
        // Search by patientId if provided
        else if (patientId) {
            medicalRecord = await MedicalRecord.find({ patientId: new mongoose.Types.ObjectId(patientId) });
            if (medicalRecord.length === 0) {
                return res.status(404).json({ errorMessage: "No medical records found for this patient." });
            }
        }         
        // Search by ownerContact if provided
        else if (ownerContact) {
            // Find the patient first by ownerContact and then fetch their medical records
            const patient = await Patient.findOne({ ownerContact: ownerContact });

            if (!patient) {
                return res.status(404).json({ errorMessage: "No patient found with this contact number" });
            }

            medicalRecord = await MedicalRecord.find({ patientId: patient._id });
            if (medicalRecord.length === 0) {
                return res.status(404).json({ errorMessage: "No medical records found for this patient." });
            }
        }
        res.status(200).json(medicalRecord);
    } catch (err) {
        console.error("Error fetching medical record:", err);
        res.status(500).json({ errorMessage: "Internal server error" });
    }
}

export default patientMedicalRecordCltr
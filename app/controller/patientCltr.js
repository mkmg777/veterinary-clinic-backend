import Patient from "../model/patientmodel.js";
import { validationResult } from "express-validator";
const patientCltr={}
import { v4 as uuidv4 } from 'uuid'

patientCltr.createpatient=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const body=req.body
        const patientData = {
            ...body,
            patientId: body.patientId || uuidv4(), // Generate unique patientId if not provided
        };
        const patient=new Patient(patientData)
        await patient.save()
        res.status(201).json(patient)
    }catch(err){
        console.error("Error creating patient:", err)
        res.status(500).json({errors:errors.array()})
    }
}

patientCltr.listpatients=async(req,res)=>{
    try{
        const patients=await Patient.find().populate('medicalHistory')
        res.status(200).json(patients)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:errors.array()})
    }
}

patientCltr.show=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors:errors.array()})
    }
    const id=req.params.id    
    try{
     const patients=await Patient.findById(id).populate('medicalHistory')
     if (!patients) {
        return res.status(404).json({ message: 'Patient not found' });
    }
        res.status(200).json(patients)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:errors.array()})
    }

}

patientCltr.updatepatients=async(req,res)=>{
    const id=req.params.id
    const body=req.body
    try{
        let updatepatient
        if(req.role=='admin' || req.role=='employee'){
            updatepatient=await Patient.findByIdAndUpdate(id,body,{new:true})
        }
        else{
            updatepatient=await Patient.findOneAndUpdate({_id:id,patient:req.patientId},body,{new:true})
        }
        if(!updatepatient){
            return res.status(404).json({})
        }
        res.json(updatepatient)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:errors.array()})
    }
}

patientCltr.deletepatient=async(req,res)=>{
    const id=req.params.id
    try{
        const patient=await Patient.findByIdAndDelete(id)
        res.status(200).json({message:'patient deleted successfully',patient})
        // res.json(patient)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:'serer error'})
    }
}

patientCltr.sendremainder=async(req,res)=>{
    try{
        await sendReminders()
        res.status(200).send('Reminders sent successfully');
    } catch (err) {
      res.status(500).send('Error sending reminders');
    }
}

patientCltr.searchbycontact = async (req, res) => {
    const {contact} = req.query; // Make sure to use the correct query parameter name
    try {
        if (!contact) {
            return res.status(400).json({ error: 'Contact number is required' });
        }
        const patients = await Patient.find({ ownerContact: contact });

        if (patients.length === 0) {
            return res.status(404).json({ message: 'No patient found with this contact number' });
        }

        res.json(patients);
    } catch (error) {
        console.error('Error fetching patient data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default patientCltr

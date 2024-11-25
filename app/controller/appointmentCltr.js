import Appointment from "../model/appointmentmodel.js";
import { validationResult } from "express-validator";
import Patient from "../model/patientmodel.js";
import Counter from "../model/countermodel.js";
import Twilio from 'twilio'

const appointmentCltr={}

const generateAppointmentNumber=async(date)=>{
    const today=new Date(date)
   
    if (isNaN(today)) {
        throw new Error(`Invalid Date provided: ${date}`);
    }
    today.setHours(0,0,0,0) //reset time to midnight
    let counter=await Counter.findOne({date:today})
    if(!counter){
        counter=new Counter({date:today,count:1})
    }else{
        counter.count+=1
    }
    await counter.save()
    return counter.count
}

appointmentCltr.createAppointment=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio account SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio auth token
    const client = new Twilio(accountSid, authToken);
    const { patient, date, time,reason,ownerName,ownerContact } = req.body;

    try{
        const date = req.body.date;
        const patientExists = await Patient.findOne({ _id: patient});
        if (!patientExists) {
            return res.status(404).json({ error: 'Patient not found' });
        }
       if (!ownerContact) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        const appointmentNumber = await generateAppointmentNumber(date)
        const appointment = new Appointment({ patient, date:new Date(date), time, reason,ownerName,appointmentNumber,ownerContact });
       
        await appointment.save()

        const message = `Hi ${ownerName}, your appointment has been successfully created. Appointment Number: ${appointment.appointmentNumber}, Date: ${date}, Time: ${time}.`
        await client.messages.create({
            body: message,
            from: +13345818407, 
            to: ownerContact
        })
        
        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: appointment
        })

    }catch(err){
        console.error('Error creating appointment:', err);
        res.status(500).json({ message: 'Internal server error' }) 
    }
}

appointmentCltr.getAppointment=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        // const appointment=await Appointment.find().populate('patient')
        const appointments = await Appointment.find()
        res.status(200).json(appointments)
    }catch(err){
        console.log(err)
        res.status(500).json({errors:errors.array()})
    }
}

appointmentCltr.updateAppointment = async (req, res) => {
    const id = req.params.id;
    const body = req.body;   
    try {
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            return res.status(404).json({ errorMessage: 'Appointment not found' });
        }
        const updateAppointment = await Appointment.findByIdAndUpdate(id, body, { new: true });
        if (!updateAppointment) {
            return res.status(404).json({ errorMessage: 'Appointment not found' });
        }
        res.status(200).json(updateAppointment);
    } catch (err) {
        console.error('Error updating appointment:', err);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

appointmentCltr.deleteAppointment=async(req,res)=>{
    const id=req.params.id
    if (!id) {
        return res.status(400).json({ message: "Appointment ID is required." });
    }
    try{
        const appointment=await Appointment.findByIdAndDelete(id)
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }
        res.status(200).json({message:'Appointment deleted successfully',appointment})
    }catch(err){
        console.error('Error deleting appointment:', err);
        res.status(500).json({ message: 'Internal server error' })
    }

}

appointmentCltr.show=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).jsnon({errors:errors.array()})
    }
    const id = req.params.id
    const body=req.body
    if (!id) {
        return res.status(400).send({ message: "Appointment ID is required." });
    }
    try{
    const appointment = await Appointment.findById(id)
    if (!appointment) {
        return res.status(404).send({ message: "Appointment not found." });
    }
    res.status(200).json(appointment)
    }catch(err){
        console.error("Error fetching appointment:", err)
        res.status(500).send({ message: "Server error" })
    }
}
export default appointmentCltr
import Billing from "../model/billingModel.js";
import { validationResult } from "express-validator";
import Razorpay from 'razorpay'
import {parse,isValid} from 'date-fns'
import Twilio from 'twilio'
  
const billingCltr={}

billingCltr.createorder=async (req, res) => {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    try {
        const options = {
            amount: req.body.amount*100, // Amount in paise
            currency: 'INR',
            receipt: req.body.receipt_id,
        };

        const order = await razorpay.orders.create(options);
        res.json({ orderId: order.id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
}

billingCltr.paymentstatus=async (req, res) => {
    const { paymentId } = req.params;

    try {
        // Fetch payment details from Razorpay
        const paymentDetails = await razorpay.payments.fetch(paymentId);
        // Check the payment status
        if (paymentDetails) {
            return res.status(200).json({ status: paymentDetails.status });
        } else {
            return res.status(404).json({ error: 'Payment not found.' });
        }
    } catch (error) {
        console.error('Error fetching payment status:', error);
        return res.status(500).json({
            error: 'Error fetching payment status.',
            details: error.message,
        });
    }
}

billingCltr.verifypayment=async (req, res) => {
    const { paymentId, orderId } = req.body;
    try {
        // Implement your verification logic
        res.json({ success: true, paymentId });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
}

billingCltr.generateBill=async(req,res)=>{
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID, // Use environment variables for security
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const { patientId, medicalRecordId, services, paymentMethod, ownerName,billingDate } = req.body; // Add paymentMethod and ownerName
    if (!billingDate) {
        return res.status(400).json({ errorMessage: "Billing date is required." });
    }

    // Create a Date object from the incoming date string
    const formattedBillingDate = new Date(billingDate);

    // Validate the Date object
    if (isNaN(formattedBillingDate.getTime())) {
        return res.status(400).json({ errorMessage: "Invalid billing date." });
    }

    try{
        // Ensure services array is provided and not empty
        if (!services || services.length === 0) {
            return res.status(400).json({ errorMessage: "Services are required to generate a bill" });
        }
    
        // Validate patientId and medicalRecordId
        if (!patientId || !medicalRecordId) {
            return res.status(400).json({ errorMessage: "Patient ID and Medical Record ID are required" });
        }
        
        const totalCost = services.reduce((acc, service) => {
            const serviceCost = parseFloat(service.cost) || 0; // Ensure cost is a number
            if (isNaN(serviceCost)) {
                return acc; // Skip if it's not a valid number
            }
            return acc + serviceCost;
        }, 0);

        if (typeof totalCost !== 'number' || isNaN(totalCost)) {
            return res.status(400).json({ errorMessage: "Invalid total cost calculation" });
        }
         const newBilling = new Billing({
            patientId,
            medicalRecordId,
            services,
            totalCost,
            paymentMethod,
            ownerName,
            billingDate: formattedBillingDate,

        })
        
        await newBilling.save()

        const options = {
            amount: totalCost*100, // Amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${newBilling._id}`,
            payment_capture: 1 // 1 for automatic capture, 0 for manual
        }
        const order = await razorpay.orders.create(options);
        res.status(201).json({ billing:newBilling, orderId: order.id })
    }catch (err) {
        res.status(500).json({
            message: 'Failed to generate bill',
            error: error.message || 'Internal Server Error',
        });
    }
}

billingCltr.get=async(req,res)=>{
    try{
        const billing=await Billing.find()
        res.json(billing)
    }catch (err) {
        console.error(err);
        res.status(500).json({ errorMessage: 'Error generating bill' });
      }
}

billingCltr.update=async(req,res)=>{
    const id=req.params.id
    const body=req.body
    try{
        let updatebill
        if(req.role=='admin' || req.role=='employee'){
            updatebill=await Billing.findByIdAndUpdate(id,body,{new:true})
        }
        else{
            updatebill=await Billing.findOneAndUpdate({_id:id},body,{new:true})
        }
        if(!updatebill){
            return res.status(404).json({ message: "Billing record not found." })
        }
        if (updatebill && updatebill.services) {
            updatebill.totalCost = updatebill.services.reduce((total, service) => total + service.cost, 0);
        }
        if (body.billingDate) {
            // Convert the string to a Date object
            const parsedDate = parse(body.billingDate, 'dd-MM-yyyy', new Date());
            if (isValid(parsedDate)) { // Check if the parsed date is valid
                updatebill.billingDate = parsedDate; // Save as Date object
            } else {
                return res.status(400).json({ message: "Invalid date format. Please use dd/MM/yyyy." });
            }
        } else {
            updatebill.billingDate = new Date(); // Set to current date if not provided
        }
        await updatebill.save()
        res.json(updatebill)
    }catch(err){
        console.error("Error during billing update:", err)
        res.status(500).json({ message: "An error occurred during the update." })
    }
}

billingCltr.delete=async(req,res)=>{
    const id=req.params.id
    try{
        let deletebill
        if(req.role=='admin' || req.role=='employee'){
            deletebill=await Billing.findByIdAndDelete(id)
        }
        else{
            deletebill=await Billing.findOneAndDelete({_id:id})
        }
        res.status(200).json({message:'billing deleted successfully',deletebill})    
    }catch(err){
        console.log(err)
        res.status(500).json({errors:'server error'})
    }
}

billingCltr.getSingleBill=async(req,res)=>{
    try {
        const bill = await Billing.findById(req.params.id) // Make sure Bill is your model for bills
        if (!bill) {
            return res.status(404).json({ errorMessage: 'Bill not found' });
        }
        res.status(200).json(bill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: 'Server error' });
    }
}

billingCltr.processPayment = async (req, res) => {
    // Initialize Razorpay instance
    const id  = req.params.id // Get billing ID from the route parameter
    const { paymentId } = req.body; // Payment ID received from Razorpay after payment     
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay Key ID
            key_secret: process.env.RAZORPAY_KEY_SECRET // Your Razorpay Key Secret
        });

        // Find the billing document
        const bill = await Billing.findById(id);
        if (!bill) {
            return res.status(404).json({ errorMessage: 'Bill not found' });
        }
        // Validate payment details
        if (!paymentId) {
            return res.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Payment ID is required.',
                },
            });
        }
        if (bill.status === 'paid') {
            return res.status(400).json({ errorMessage: 'Payment has already been captured' });
        }
        const totalCost = bill.totalCost*100 // totalCost in paise
        if (isNaN(totalCost) || totalCost <= 0) {
            return res.status(400).json({ errorMessage: 'Invalid total cost' });
        }

        const paymentDetails = await razorpay.payments.fetch(paymentId);
        if (paymentDetails.status === 'captured') {
            return res.status(400).json({
                statusCode: 400,
                error: {
                    code: 'BAD_REQUEST_ERROR',
                    description: 'This payment has already been captured',
                    metadata: { payment_id: paymentId }
                }
            });
        }

        // Capture the payment with Razorpay
        const paymentResponse = await razorpay.payments.capture(paymentId, totalCost); // totalCost in paise

        // Check if payment is successful
        if (paymentResponse.status === 'captured') {
            // Update the bill status to 'paid'
            bill.status = 'paid';
            bill.paymentDetails = paymentResponse; // Optionally, save payment details
            bill.paymentCaptured = true;
            await bill.save();

            // Return success response
            return res.status(200).json({ message: 'Payment successful', bill });
        } else {
            return res.status(400).json({ errorMessage: 'Payment not captured', paymentResponse });
        }
    } catch (error) {
        console.error('Payment processing error:', error); // Log the entire error object
        res.status(500).json({ errorMessage: 'Payment processing failed', details: error.message || 'No error message available' });
    }
};

billingCltr.billsms=async(req,res)=>{
    const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio account SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio auth token
    const client = new Twilio(accountSid, authToken);
    const { ownerContact, message } = req.body;

    try {
        const sms = await client.messages.create({
            body: message,
            from: +13345818407, // Twilio phone number
            to: ownerContact, // Recipient phone number with country code
        });

        res.status(200).json({ success: true, message: 'SMS sent successfully!', sms });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ success: false, message: 'Failed to send SMS', error });
    }
}


billingCltr.track=async (req, res) => {
    const { eventType, eventData, timestamp } = req.body;
    if (!eventType || !eventData || !timestamp) {
        return res.status(400).json({ errorMessage: 'Missing required fields' });
    }
    // Here you would save the eventData to a logging or analytics service
    console.log('Tracking event:', eventType, eventData, timestamp);
    res.status(200).send({ status: 'success' });
}

export default billingCltr
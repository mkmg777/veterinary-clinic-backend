import cron from 'node-cron'
import nodemailer from 'nodemailer'
import twilio from 'twilio'
import Appointment from '../app/model/appointmentmodel.js'

//Twilio configuration 
const accountSid=process.env.TWILIO_ACCOUNT_SID
const authToken=process.env.TWILIO_ACCOUNT_TOKEN
const client=twilio(accountSid,authToken)

//Nodemailer configuration
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.nodemailer,
        pass:process.env.EMAIL_PASSWORD
    }
})

// Function to send SMS
const sendSMS = (to, message) => {
    client.messages.create({
      body: message,
      from: '+your_twilio_number',
      to: to
    })
    .then(message => console.log(message.sid))
    .catch(err => console.error(err));
  }

// Function to send Email
const sendEmail = (to, subject, message) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      text: message
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error(error);
      }
      console.log('Email sent: ' + info.response);
    })
  }
  
// Function to check for upcoming appointments and send reminders
const sendReminders = async () => {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
  
    const upcomingAppointments = await Appointment.find({
      nextVisitDate: {
        $gte: today,
        $lte: threeDaysLater
      }
    }).populate('patient');
  
    upcomingAppointments.forEach(appointment => {
      const { ownerEmail, ownerPhone, nextVisitDate, nextVaccinationDate } = appointment.patient;
  
      const message = `Reminder: Your pet has an upcoming appointment on ${nextVisitDate}. Please ensure you attend.`;
      const vaccinationMessage = nextVaccinationDate
        ? `Also, remember your pet's next vaccination is scheduled for ${nextVaccinationDate}.`
        : '';
  
      if (ownerPhone) {
        sendSMS(ownerPhone, message + ' ' + vaccinationMessage);
      }
      if (ownerEmail) {
        sendEmail(ownerEmail, 'Upcoming Appointment Reminder', message + ' ' + vaccinationMessage);
      }
    });
  };
  
  // Schedule daily job at midnight
  cron.schedule('0 0 * * *', sendReminders);

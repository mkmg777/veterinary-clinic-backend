import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import bodyParser from 'body-parser'
import configureDb from './configure/db.js'
import { checkSchema } from 'express-validator'
import { userRegisterSchema,userLoginSchema ,forgotPasswordSchema,resetPasswordSchema} from './app/validator/uservalidator.js'
import userCltr from './app/controller/userCltr.js'
import authenticateUser from './app/middleware/authenticateUser.js'
import { authorizeUser} from './app/middleware/authorizeUser.js'
import {patientvalidationSchema,patientIdValidationSchema} from './app/validator/patientvalidator.js'
import patientCltr from './app/controller/patientCltr.js'
import appointmentCltr from './app/controller/appointmentCltr.js'
import searchCltr from './app/controller/searchCltr.js'
import patientMedicalRecordCltr from './app/controller/patientMedicalRecordCltr.js'
import {medicalrecordtvalidationSchema,medicalrecordIdValidationSchema} from './app/validator/medicalrecordvalidator.js'
import billingCltr from './app/controller/billingCltr.js'
import { billingIdValidationSchema, billingValidationSchema } from './app/validator/billingValidation.js'
import { errorHandler } from './app/middleware/errorHandler.js'

const port=process.env.PORT || 3050
const app=express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(errorHandler )

configureDb()

app.post('/api/users/register',checkSchema(userRegisterSchema),userCltr.register)
app.post('/api/users/login',checkSchema(userLoginSchema),userCltr.login)

app.post('/api/forgot-password',checkSchema(forgotPasswordSchema),userCltr.forgotPassword)
app.post('/api/reset-password',checkSchema(resetPasswordSchema),userCltr.resetPassword)

app.get('/api/users/account',authenticateUser,authorizeUser(['admin','employee','customer']),userCltr.account)
app.get('/api/users/list',authenticateUser,authorizeUser(['admin','employee']),userCltr.listusers)
app.delete('/api/users/:id',authenticateUser,userCltr.delete)

//patients routes
app.post('/api/patients',checkSchema(patientvalidationSchema),authenticateUser,authorizeUser(['admin','employee','customer']),patientCltr.createpatient)
app.get('/api/patients',authenticateUser,authorizeUser(['admin','employee']),patientCltr.listpatients)
app.put('/api/patients/:id',authenticateUser,authorizeUser(['admin','employee']),patientCltr.updatepatients)
app.delete('/api/patients/:id',authenticateUser,authorizeUser(['admin','employee']),patientCltr.deletepatient)
app.get('/api/patients/:id',checkSchema(patientIdValidationSchema),authenticateUser,authorizeUser(['admin','employee']),patientCltr.show)

app.get('/api/patients',authenticateUser,authorizeUser(['admin','employee']),patientCltr.searchbycontact)

//Appointment routes
app.post('/api/appointments',authenticateUser,authorizeUser(['customer','admin','employee']),appointmentCltr.createAppointment)
app.get('/api/appointments',authenticateUser,authorizeUser(['admin','employee']),appointmentCltr.getAppointment)
app.put('/api/appointments/:id',authenticateUser,authorizeUser(['customer','admin','employee']),appointmentCltr.updateAppointment)
app.delete('/api/appointments/:id',authenticateUser,authorizeUser(['customer','admin','employee']),appointmentCltr.deleteAppointment)
app.get('/api/appointments/:id',authenticateUser,authorizeUser(['admin','employee']),appointmentCltr.show)

//search patient by id
app.get('/api/searchPatients',authenticateUser,authorizeUser(['customer','admin','employee']),searchCltr.searchPatients)
// app.get('/api/patients/search/:id',authenticateUser,authorizeUser(['customer','admin','employee']),searchCltr.searchPatients)

//medicalRecord routes
app.post('/api/patientMedicalRecord',authenticateUser,authorizeUser(['admin','employee','customer']),checkSchema(medicalrecordtvalidationSchema),patientMedicalRecordCltr.create)
app.put('/api/patientMedicalRecord/:id',authenticateUser,authorizeUser(['admin','employee']),checkSchema(medicalrecordIdValidationSchema),patientMedicalRecordCltr.update)
app.delete('/api/patientMedicalRecord/:id',authenticateUser,authorizeUser(['admin','employee']),checkSchema(medicalrecordIdValidationSchema),patientMedicalRecordCltr.delete)
app.get('/api/patientMedicalRecord/all',authenticateUser,authorizeUser(['admin','employee']),patientMedicalRecordCltr.getMedicalRecordAll)
app.get('/api/patientMedicalRecord',authenticateUser,authorizeUser(['admin','employee']),patientMedicalRecordCltr.getMedicalRecord)
app.get('/api/patientMedicalRecord/:id', authenticateUser, authorizeUser(['admin','employee']), patientMedicalRecordCltr.show);

//Bill Generation
app.post('/api/generatebill',authenticateUser,authorizeUser(['admin','employee']),checkSchema(billingValidationSchema),billingCltr.generateBill)
app.get('/api/generatebill',authenticateUser,authorizeUser(['admin','employee']),billingCltr.get)
app.put('/api/generatebill/:id',authenticateUser,authorizeUser(['admin','employee']),checkSchema(billingIdValidationSchema),billingCltr.update)
app.delete('/api/generatebill/:id',authenticateUser,authorizeUser(['admin','employee']),checkSchema(billingIdValidationSchema),billingCltr.delete)
app.get('/api/generatebill/:id',authenticateUser,authorizeUser(['admin','employee']),checkSchema(billingIdValidationSchema),billingCltr.getSingleBill)
app.post('/api/generatebill/:id', authenticateUser, authorizeUser(['admin', 'employee']), billingCltr.processPayment);
app.post('/api/track/event',billingCltr.track)
app.post('/api/billsms',authenticateUser,authorizeUser(['admin', 'employee']),billingCltr.billsms)

//Razarpay routes
app.post('/api/create-order',billingCltr.createorder );
app.get('/api/payment-status/:paymentId', authenticateUser,authorizeUser,billingCltr.paymentstatus );
// Endpoint to verify payment
app.post('/api/verify-payment', billingCltr.verifypayment);

app.listen(port,()=>{
    console.log('server connected to port',port)
})
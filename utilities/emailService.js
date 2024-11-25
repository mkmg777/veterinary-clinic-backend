import nodemailer from 'nodemailer'

export const sendEmail=async(mailOptions)=>{
    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'meghana.gh2014@gmail.com',
            pass:'puyo wcot pvss kxxi '
        }
    })
    return transporter.sendMail(mailOptions)
}
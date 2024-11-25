import { validationResult } from 'express-validator'
import User from '../model/usermodel.js'
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../../utilities/emailService.js'


const userCltr={}

userCltr.register=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {name,email,password,role}=req.body
    try{
        const userscount=await User.countDocuments()
        const user=new User({name,email,password,role:req.body.role||'customer'})
        const salt=await bcryptjs.genSalt()
        const hash=await bcryptjs.hash(password,salt)
        user.password=hash

        if(userscount===0){
            user.role='admin'
        }
        if(userscount===1){
            user.role='employee'
        }
        await user.save()
        res.status(201).json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({ error: 'Server error' })
    }
}

userCltr.login=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {email,password}=req.body
    try{
        const user= await User.findOne({email})
        if(!user){
            return res.status(401).json({error:' invalid email or password'})
        }
        const isVerified=await bcryptjs.compare(password,user.password)
        if(!isVerified){
            return res.status(401).json({error:'Invalid email or password'})
        }
        
        const tokendata={userId:user._id,role:user.role}
        const token=jwt.sign(tokendata,process.env.SECRET_KEY,{expiresIn:"7d"})
        res.json({ token, user });
    }catch(err){
        console.log('Login error:',err)
        return res.status(500).json({error:'something went wrong'})
    }
}

userCltr.listusers=async(req,res)=>{
    try{
        const user=await User.find()
        res.json(user)
    }catch(err){
        console.log('Error fetching users:',err)
        res.status(500).json({errors:'something went wrong'})
    }
}

userCltr.account=async(req,res)=>{
    try{
        const user = await User.findById(req.userId);
        res.json(user)
    }catch(err){
        console.log('Error fetching account:',err)
        return res.status(500).json({errors:'Something went wrong'})
    }
}

userCltr.delete=async(req,res)=>{
   try{
        const id=req.params.id
        if(id==req.userId){
            return res.status(400).json({error:'you cannot delete your own account'})
        }
        const user=await User.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' ,user});
    }catch(err){
    console.log(err)
    return res.status(500).json({error:'something went wrong'})
   }
}


userCltr.forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Email does not exist' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 900000; // 15 minutes
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            subject: 'Password Reset',
             html: `<p>You requested for password reset</p>
                   <h5>Click on this <a href="${resetLink}">link</a> to reset your password</h5>`
        };

        await sendEmail(mailOptions);
        res.json({ message: 'Reset link sent to your email' });
        console.log(`Token: ${token}`);
        console.log(`Token expiration: ${new Date(user.resetTokenExpiration)}`);

    } catch (err) {
        console.log('Error processing forgot password:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

userCltr.resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;
    try {
        console.log('Reset token:', token);
        console.log('Received new password:', newPassword);

        const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        const salt = await bcryptjs.genSalt();
        const hash = await bcryptjs.hash(newPassword, salt);
       
        console.log('Hashed Password:', hash)

        user.password = hash;
        user.passwordChangedAt = new Date();
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        console.log('Password reset successful for user:', user.email);

        const mailOptions = {
            to: user.email,
            subject: 'Password Reset Successful',
            html: `<p>Your password has been successfully reset, ${user.email}</p>`
        };

        await sendEmail(mailOptions);
        console.log('Email sent successfully to', user.email)

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
export default userCltr
import jwt from 'jsonwebtoken';

export default function authenticateUser(req, res, next) {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(401).json({ errors: 'token is required' });
    }
    const token1 = token.split(' ')[1];
    try {
        console.log('JWT Secret:',process.env.SECRET_KEY)
        const tokenData = jwt.verify(token1, process.env.SECRET_KEY);
        console.log("Token Data:", tokenData)
        // req.userId = tokenData.userId;
        // req.role=tokenData.role
        req.user = tokenData;
        next();
    } catch (err) {
        return res.status(401).json({ errors: err.message });
    }
}
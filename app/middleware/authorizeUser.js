export const authorizeUser=(permittedRole)=>{
    return(req,res,next)=>{
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Unauthorized, please log in' });
          }
        if(permittedRole.includes(req.user.role)){
            next()
        }
        else{
            return res.status(403).json({error:'you dont have access to this page'})
        }
    }
}


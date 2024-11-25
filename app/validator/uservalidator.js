
import User from '../model/usermodel.js'

export const userRegisterSchema={
    name:{
        exists:{
            errorMessage:'name is required'
        },
        notEmpty:{
            errorMessage:'name should not be empty'
        },
        trim:true
    },
    email:{
        exists:{
            errorMessage:'email is required'
        },
        notEmpty:{
            errorMessage:'email should not be empty'
        },
        trim:true,
        isEmail:{
            errorMessage:'email should be in valid format'
        },
        normalizeEmail:true,
        custom:{
            options:async function (value) {
                try{
                    const user=await User.findOne({email:value})
                    if(user){
                        throw new Error('email is already taken')
                    }
                }catch(err){
                    throw new Error(err.message)
                }
                return true
            }
        }
    },
    password:{
        exists:{
            errorMessage:'password is required'
        },
        notEmpty:{
            errorMessage:'password should not be empty'
        },
        trim:true,
        isStrongPassword:{
            options:{
                minLength:8,
                minNumber:1,
                minUppercase:1,
                minLowercase:1,
                minSymbol:1
            },
            errorMessage:'password should contain atleast 1 Number,1 Uppercase, 1 Lowercase,1 Symbol and it must contain minimum of 8 characters long '
        }
    }
}

export const userLoginSchema={
    // name:{
    //     exists:{
    //         errorMssage:'name is required'
    //     },
    //     notEmpty:{
    //         errorMessage:'name should not be empty'
    //     },
    //     trim:true,
    // },
    email:{
        exists:{
            errorMessage:'email is required'
        },
        notEmpty:{
            errorMessage:'email should not be empty'
        },
        isEmail:{
            errorMessage:'email should be in valid format'
        },
        trim:true,
        normalizeEmail:true
    },
    password:{
        exists:{
            errorMessage:'password is required'
        },
        notEmpty:{
            errorMessage:'password should not be empty'
        },
        trim:true,
        isStrongPassword:{
            options:{
                minLength:8,
                minNumber:1,
                minUppercase:1,
                minLowercase:1,
                minSymbol:1
            },
            errorMessage:"password should contain atleast 1 uppercase, 1 lowercase,1 special symbol and 1 number and it must contain minimum of 8 characters long"
        }
    }
}

export const forgotPasswordSchema={
    email:{
        exists:{
            errorMessage:'email is required'
        },
        notEmpty:{
            errorMessage:'email should not be empty'
        },
        isEmail:{
            errorMessage:'email should be in valid format'
        },
        trim:true,
        normalizeEmail:true
    }
}

export const resetPasswordSchema={ 
    newPassword:{
        exists:{
            errorMessage:'password is required'
        },
        notEmpty:{
            errorMessage:'password should not be empty'
        },
        trim:true,
        isStrongPassword:{
            options:{
                minLength:8,
                minNumber:1,
                minUppercase:1,
                minLowercase:1,
                minSymbol:1
            },
            errorMessage:"password should contain atleast 1 uppercase, 1 lowercase,1 special symbol and 1 number and it must contain minimum of 8 characters long"
        }
    }
}
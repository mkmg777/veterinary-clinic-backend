import Billing from "../model/billingModel.js"

export const billingValidationSchema={
    patientId:{
        in:['body'],
        exists:{
            errorMessage:'patientId is required'
        },
        notEmpty:{
            errorMessage:'patientId should not be empty'
        },
        trim:true,
    },
    medicalRecordId:{
        in:['body'],
        exists:{
            errorMessage:'medical record id is required'
        },
        notEmpty:{
            errorMessage:'medical record id should not be empty'
        },
        trim:true,
    },
    
    billingDate:{
        in:['body'],
        exists:{
            errorMessage:'billing date is required'
        },
        notEmpty:{
            errorMessage:'billing date should not be empty'
        },
        trim:true,
        isISO8601: { // Validate the date format (ISO 8601)
            errorMessage: 'Invalid date format. Please use YYYY-MM-DD.'
        },
        custom:{
            options:function(value){
                if(new Date(value) > new Date()){
                    throw new Error('Date cannot be greater than today')
                }
                return true
            }
        } 
    }
}

export const billingIdValidationSchema={
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:'Invalid Object Id Format'
        }
    }
 }
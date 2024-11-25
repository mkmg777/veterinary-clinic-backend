import Appointment from "../model/appointmentmodel.js"
import Patient from "../model/patientmodel.js"

export const appointmentvalidationSchema={
    patient:{
        in:['body'],
        exists:{
            errorMessage:'patient name is required'
        },
        notEmpty:{
            errorMessage:'patient name should not be empty'
        },
        trim:true,
        custom:{
            options:function(value){
                return Patient.findById(value)
                .then((patient)=>{
                    if(!patient){
                        throw new Error('Patient Id Does Not exists in the Db')
                    }
                    return true
                })
            }
        }
    },
    date:{
        // isDate:{
        //     options:{format:'yyyy-mm-dd'}
        // },
        custom:{
            options:function(value){
                if(new Date(value) < new Date()){
                    throw new Error('Date cannot be lesser than today')
                }
                return true
            }
        }
    },
    ownerName:{
        exists:{
            errorMessage:'owner name is required'
        },
        notEmpty:{
            errorMessage:'owner name should not be empty'
        },
        trim:true,
    }
 }

 export const appointmentIdValidationSchema={
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:'Invalid Object Id Format'
        }
    }
 }

 
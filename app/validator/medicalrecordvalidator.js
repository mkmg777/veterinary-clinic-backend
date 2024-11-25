import MedicalRecord from "../model/medicalrecordmodel.js"
import Patient from "../model/patientmodel.js"
export const medicalrecordtvalidationSchema={
    patientId:{
        in:['body'],
        exists:{
            errorMessage:'patient Id is required'
        },
        notEmpty:{
            errorMessage:'patient Id should not be empty'
        },
        trim:true,
        custom:{
            options:async function(value){
                const patient = await Patient.findById(value);
                if (!patient) {
                    throw new Error('Patient Id does not exist in the database');
                }
                    return true
            }
        }
    },
    date:{
        custom: {
            options: function (value) {
                // Parse the date to check if it's valid
                const parsedDate = new Date(value);
                if (isNaN(parsedDate)) {
                    throw new Error('Invalid date format');
                }
                if (parsedDate > new Date()) {
                    throw new Error('Date cannot be greater than today');
                }
                return true;
            }
        }
    },
    treatment:{
        in:['body'],
        exists:{
            errorMessage:'treatment details is required'
        },
        notEmpty:{
            errorMessage:'treatment details should not be empty'
        },
        trim:true,
    },
    prescription:{
        in:['body'],
        exists:{
            errorMessage:'prescription details is required'
        },
        notEmpty:{
            errorMessage:'prescription details should not be empty'
        },
        trim:true,
    }
    
 }

 export const medicalrecordIdValidationSchema={
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:'Invalid Object Id Format'
        }
    }
 }

 
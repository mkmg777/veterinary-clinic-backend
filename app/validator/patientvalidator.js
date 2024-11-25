import MedicalRecord from "../model/medicalrecordmodel.js";
import Patient from "../model/patientmodel.js";

export const patientvalidationSchema={
    name:{
        exists:{
            errorMessage:'name is required'
        },
        notEmpty:{
            errorMessage:'name should not be empty'
        },
        trim:true
    },
    species:{
        exists:{
            errorMessage:'species is required'
        },
        notEmpty:{
            errorMessage:'species should not be empty'
        },
        trim:true
    },
    breed:{
        exists:{
            errorMessage:'breed is required'
        },
        notEmpty:{
            errorMessage:'breed should not be empty'
        },
        trim:true
    },
    age:{
        exists:{
            errorMessage:'age is required'
        },
        notEmpty:{
            errorMessage:'age should not be empty'
        },
        trim:true
    },
    ownerName:{
        exists:{
            errorMessage:'ownername is required'
        },
        notEmpty:{
            errorMessage:'ownername should not be empty'
        },
        trim:true
    },
    medicalHistory:{
        optional:true,
        // exists:{
        //     errorMessage:'medical history is required'
        // },
        // notEmpty:{
        //     errorMessage:'medical history should not be empty'
        // },
        isArray:{
            errorMessage:'Medical history should be an array'
        },
        trim:true,
        // custom:{
        //     options:function(value){
        //         return MedicalRecord.findById(value)
        //        .then((medicalrecord)=>{
        //         if(!medicalrecord){
        //             throw new Error('medical id doesnot exists in DB')
        //          }
        //         return true
        //      })

        //     }
        // }
        custom: {
            options: async (values) => {
                if (values.length === 0) return true; // Allow empty array

                // Validate each medical record ID
                for (const value of values) {
                    const medicalrecord = await MedicalRecord.findById(value);
                    if (!medicalrecord) {
                        throw new Error(`Medical ID ${value} does not exist in DB`);
                    }
                }
                return true;
            }
        }
    }
}

export const patientIdValidationSchema={
    id:{
        in:['params'],
        isMongoId:{
            errorMessage:'Invalid Object Id Format'
        }
    }
 }


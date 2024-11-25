import Patient from "../model/patientmodel.js";
import MedicalRecord from "../model/medicalrecordmodel.js";

const searchCltr = {};

// Search by patientId, medicalRecordId, or ownerContact
searchCltr.searchPatients = async (req, res) => {
    const { patientId, medicalId, ownerContact } = req.query;
    if (!patientId && !medicalId && !ownerContact) {
        return res.status(400).json({ errorMessage: "Provide at least one search parameter: patientId, medicalId, or ownerContact." });
    }

    try {
        let patient;
        let medicalRecord;
        // Search by patientId
        if (patientId) {
            patient = await Patient.findById(patientId);
            if (!patient) {
                return res.status(404).json({ errorMessage: 'Patient not found' });
            }
        }

        // Search by medicalRecordId
        if (medicalId) {
            medicalRecord = await MedicalRecord.findById(medicalId);
            if (!medicalRecord) {
                return res.status(404).json({ errorMessage: 'Medical record not found' });
            }

            // Get patient details linked to the medical record
            patient = await Patient.findById(medicalRecord.patientId);
            if (!patient) {
                return res.status(404).json({ errorMessage: 'Patient not found for the medical record' });
            }
        }

        // Search by ownerContact
        if (ownerContact) {
            patient = await Patient.findOne({ ownerContact });
            if (!patient) {
                return res.status(404).json({ errorMessage: 'No patient found with this owner contact' });
            }
        }

        // Fetch medical history if available
        const medicalHistory = await MedicalRecord.find({ patientId: patient._id });

        // Return combined data
        res.status(200).json({
            patientId: patient._id,
            name: patient.name,
            species: patient.species,
            breed: patient.breed,
            age: patient.age,
            ownerName: patient.ownerName,
            ownerContact: patient.ownerContact,
            medicalHistory: medicalHistory || []
        });
    } catch (err) {
        console.error("Error searching patient or medical record:", err);
        res.status(500).json({ errorMessage: "Internal server error" });
    }
};

export default searchCltr
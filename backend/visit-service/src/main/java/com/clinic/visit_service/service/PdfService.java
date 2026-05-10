package com.clinic.visit_service.service;

import com.clinic.visit_service.entity.Prescription;
import com.clinic.visit_service.entity.Visit;
import java.util.List;

public interface PdfService {
    /**
     * Generates a PDF for a single prescription and returns the file path or key.
     */
    String generatePrescriptionPdf(Visit visit, Prescription prescription, String patientName);

    /**
     * Generates a single PDF containing all prescriptions for a visit.
     */
    String generateAllPrescriptionsPdf(Visit visit, List<Prescription> prescriptions, String patientName);
}

package com.clinic.visit_service.service.impl;

import com.clinic.visit_service.entity.Prescription;
import com.clinic.visit_service.entity.Visit;
import com.clinic.visit_service.service.PdfService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class PdfServiceImpl implements PdfService {

    private final String LOCAL_STORAGE_PATH = "storage/prescriptions";

    public PdfServiceImpl() {
        try {
            Files.createDirectories(Paths.get(LOCAL_STORAGE_PATH));
        } catch (Exception e) {
            log.error("Could not create storage directory", e);
        }
    }

    @Override
    public String generatePrescriptionPdf(Visit visit, Prescription prescription, String patientName) {
        String fileName = "rx_" + prescription.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";
        byte[] pdfBytes = createPdfContent(visit, List.of(prescription), patientName);
        
        return saveFile(fileName, pdfBytes);
    }

    @Override
    public String generateAllPrescriptionsPdf(Visit visit, List<Prescription> prescriptions, String patientName) {
        String fileName = "visit_" + visit.getId() + "_all_rx.pdf";
        byte[] pdfBytes = createPdfContent(visit, prescriptions, patientName);
        
        return saveFile(fileName, pdfBytes);
    }

    private byte[] createPdfContent(Visit visit, List<Prescription> prescriptions, String patientName) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                contentStream.setLeading(25f);
                contentStream.newLineAtOffset(50, 750);
                
                contentStream.showText("MEDICAL PRESCRIPTION");
                contentStream.newLine();
                
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.showText("Visit ID: " + visit.getId());
                contentStream.newLine();
                contentStream.showText("Patient Name: " + patientName);
                contentStream.newLine();
                contentStream.showText("Date: " + visit.getCreatedAt());
                contentStream.newLine();
                contentStream.newLine();
                
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.showText("Medications:");
                contentStream.newLine();
                contentStream.newLine();
                
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                for (Prescription rx : prescriptions) {
                    contentStream.showText("- " + rx.getMedicationName() + " (" + rx.getDosage() + ")");
                    contentStream.newLine();
                    contentStream.showText("  Frequency: " + rx.getFrequency() + " | Duration: " + rx.getDurationDays() + " days");
                    contentStream.newLine();
                    if (rx.getNotes() != null && !rx.getNotes().isEmpty()) {
                        contentStream.showText("  Notes: " + rx.getNotes());
                        contentStream.newLine();
                    }
                    contentStream.newLine();
                }
                
                contentStream.endText();
            }

            document.save(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF", e);
            throw new RuntimeException("PDF Generation failed", e);
        }
    }

    private String saveFile(String fileName, byte[] content) {
        try {
            // FOR TESTING: Save to local filesystem
            Path path = Paths.get(LOCAL_STORAGE_PATH, fileName);
            Files.write(path, content);
            log.info("PDF saved locally at: {}", path.toAbsolutePath());
            
            /*
             * TODO: AWS S3 INTEGRATION
             * When you are ready to use S3, comment out the local saving logic above
             * and use the following pattern:
             * 
             * 1. Inject AmazonS3 client (or S3Client for SDK v2)
             * 2. Use putObject to upload the byte array:
             * 
             * s3Client.putObject(PutObjectRequest.builder()
             *     .bucket(bucketName)
             *     .key("prescriptions/" + fileName)
             *     .build(), 
             *     RequestBody.fromBytes(content));
             * 
             * 3. Return the S3 key: "prescriptions/" + fileName
             */
            
            return fileName; // Currently returning local filename as the 'key'
        } catch (Exception e) {
            log.error("Error saving PDF file", e);
            throw new RuntimeException("File saving failed", e);
        }
    }
}

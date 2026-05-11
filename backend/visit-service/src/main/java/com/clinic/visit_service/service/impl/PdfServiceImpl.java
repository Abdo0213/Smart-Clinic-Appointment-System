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
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import java.time.Duration;

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
    private final Environment env;

    public PdfServiceImpl(Environment env) {
        this.env = env;
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
                    contentStream.showText(
                            "  Frequency: " + rx.getFrequency() + " | Duration: " + rx.getDurationDays() + " days");
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
            // Path path = Paths.get(LOCAL_STORAGE_PATH, fileName);
            // Files.write(path, content);
            // log.info("PDF saved locally at: {}", path.toAbsolutePath());

            String bucketName = env.getProperty("aws.s3.bucket-name");
            String region = env.getProperty("aws.region");
            String accessKey = env.getProperty("aws.access-key");
            String secretKey = env.getProperty("aws.secret-key");

            S3Client s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .build();

            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key("prescriptions/" + fileName)
                    .build(),
                    RequestBody.fromBytes(content));

            // Generate presigned URL
            try (S3Presigner presigner = S3Presigner.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .build()) {

                GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofHours(1))
                        .getObjectRequest(builder -> builder.bucket(bucketName).key("prescriptions/" + fileName))
                        .build();

                PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
                String presignedUrl = presignedRequest.url().toString();
                log.info("Generated presigned URL for {}: {}", fileName, presignedUrl);
                return presignedUrl;
            }
        } catch (Exception e) {
            log.error("Error saving PDF file to S3", e);
            throw new RuntimeException("File saving failed", e);
        }
    }
}

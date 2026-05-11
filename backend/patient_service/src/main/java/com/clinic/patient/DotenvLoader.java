package com.clinic.patient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class DotenvLoader {
    public static void load() {
        try {
            if (Files.exists(Paths.get(".env"))) {
                Files.lines(Paths.get(".env"))
                    .filter(line -> line.contains("=") && !line.trim().startsWith("#"))
                    .forEach(line -> {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        System.setProperty(key, value);
                    });
            }
        } catch (IOException e) {
            System.err.println("Could not load .env file: " + e.getMessage());
        }
    }
}

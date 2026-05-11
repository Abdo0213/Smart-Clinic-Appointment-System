package com.clinic.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PatientServiceApplication {

	public static void main(String[] args) {
		DotenvLoader.load();
		SpringApplication.run(PatientServiceApplication.class, args);
	}

}

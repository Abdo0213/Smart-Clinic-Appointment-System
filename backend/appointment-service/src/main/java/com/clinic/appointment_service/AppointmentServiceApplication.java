package com.clinic.appointment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AppointmentServiceApplication {

	public static void main(String[] args) {
		DotenvLoader.load();
		SpringApplication.run(AppointmentServiceApplication.class, args);
	}

}

package com.clinic.visit_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class RecordAlreadySignedException extends RuntimeException {
    public RecordAlreadySignedException(String message) {
        super(message);
    }
}

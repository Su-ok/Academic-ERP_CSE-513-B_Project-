package com.esd.project.Exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid data type for parameter '%s': expected %s but received '%s'",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown type",
                ex.getValue());
        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null 
                                ? fieldError.getDefaultMessage() 
                                : "Invalid value",
                        (existing, replacement) -> existing
                ));

        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("message", "Validation failed");
        error.put("errors", validationErrors);
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // Database Exceptions
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = "Data integrity violation";
        String rootCause = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        
        // Check for specific constraint violations
        if (rootCause != null) {
            if (rootCause.contains("Duplicate entry") || rootCause.contains("UNIQUE constraint")) {
                message = "Duplicate entry: This record already exists";
            } else if (rootCause.contains("foreign key constraint") || rootCause.contains("FOREIGN KEY")) {
                message = "Cannot delete or update: This record is referenced by other records";
            } else if (rootCause.contains("cannot be null") || rootCause.contains("NOT NULL")) {
                message = "Required fields cannot be null";
            }
        }
        
        return buildResponse(message, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleEmptyResultDataAccess(EmptyResultDataAccessException ex) {
        return buildResponse("The requested resource does not exist", HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> violations = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (existing, replacement) -> existing
                ));

        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("message", "Constraint validation failed");
        error.put("errors", violations);
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // HTTP Request Exceptions
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        String message = String.format("Method '%s' is not supported for this endpoint. Supported methods: %s",
                ex.getMethod(),
                ex.getSupportedHttpMethods() != null ? ex.getSupportedHttpMethods().toString() : "N/A");
        return buildResponse(message, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        String message = String.format("Media type '%s' is not supported. Supported types: %s",
                ex.getContentType(),
                ex.getSupportedMediaTypes());
        return buildResponse(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingRequestParameter(MissingServletRequestParameterException ex) {
        String message = String.format("Required parameter '%s' of type '%s' is missing",
                ex.getParameterName(),
                ex.getParameterType());
        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<Map<String, Object>> handleMissingPathVariable(MissingPathVariableException ex) {
        String message = String.format("Required path variable '%s' is missing", ex.getVariableName());
        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }

    // JSON/Request Body Exceptions
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Malformed JSON request body or invalid request format";
        String rootCause = ex.getRootCause() != null ? ex.getRootCause().getMessage() : null;
        
        if (rootCause != null) {
            if (rootCause.contains("Unexpected end-of-input") || rootCause.contains("EOF")) {
                message = "Incomplete JSON request body";
            } else if (rootCause.contains("Cannot deserialize") || rootCause.contains("Unrecognized field")) {
                message = "Invalid JSON format or unrecognized field";
            } else if (rootCause.contains("Cannot parse")) {
                message = "Invalid date or number format in request body";
            }
        }
        
        return buildResponse(message, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotWritable(HttpMessageNotWritableException ex) {
        String message = "Error serializing response. Please contact support if the problem persists.";
        return buildResponse(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Security Exceptions
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse("Access denied: You do not have permission to perform this action", 
                HttpStatus.FORBIDDEN);
    }

    // Generic Exception Handler (should be last)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        // Log the full exception for debugging (you can add logging here)
        // ex.printStackTrace(); // or use a logger
        
        // Return a generic message to avoid exposing internal error details
        String message = "An unexpected error occurred. Please contact support if the problem persists.";
        return buildResponse(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", status.value());
        error.put("message", message);
        return new ResponseEntity<>(error, status);
    }
}

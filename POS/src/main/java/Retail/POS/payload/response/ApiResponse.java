package Retail.POS.payload.response;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import lombok.Data;

/**
 * Standard API Response wrapper for all endpoints
 * Provides consistent error and success responses across the application
 */
@Data
public class ApiResponse {
    private boolean success = true;
    private String message;
    private Object data;
    private String status;  // Error code like "INSUFFICIENT_STOCK", "NOT_FOUND", etc.
    private Map<String, String> fieldErrors;  // For validation errors
    private LocalDateTime timestamp = LocalDateTime.now();

    // Constructors for convenience
    public ApiResponse() {}

    public ApiResponse(String message) {
        this.message = message;
    }

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ApiResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public ApiResponse(boolean success, String message, String status) {
        this.success = success;
        this.message = message;
        this.status = status;
    }

    // Builder-like convenience methods
    public ApiResponse withStatus(String status) {
        this.status = status;
        return this;
    }

    public ApiResponse withData(Object data) {
        this.data = data;
        return this;
    }

    public ApiResponse withFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
        return this;
    }

    public void addFieldError(String field, String error) {
        if (this.fieldErrors == null) {
            this.fieldErrors = new HashMap<>();
        }
        this.fieldErrors.put(field, error);
    }
}

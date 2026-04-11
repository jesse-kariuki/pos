package Retail.POS.exceptions;

import java.util.HashMap;
import java.util.Map;

/**
 * Exception for input validation failures
 * Supports multiple field-level errors
 */
public class ValidationException extends RuntimeException {

    private Map<String, String> fieldErrors;
    private String errorCode;

    public ValidationException(String message) {
        super(message);
        this.errorCode = "VALIDATION_FAILED";
        this.fieldErrors = new HashMap<>();
    }

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.errorCode = "VALIDATION_FAILED";
        this.fieldErrors = fieldErrors;
    }

    public ValidationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.fieldErrors = new HashMap<>();
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void addFieldError(String field, String error) {
        this.fieldErrors.put(field, error);
    }

    public String getErrorCode() {
        return errorCode;
    }
}

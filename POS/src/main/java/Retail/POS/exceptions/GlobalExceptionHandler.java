package Retail.POS.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import Retail.POS.payload.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the POS application
 * Catches all exceptions and returns consistent API responses
 * Logs errors for debugging and monitoring
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle insufficient stock errors (e.g., when trying to sell more items than available)
     */
    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ApiResponse> handleInsufficientStock(
            InsufficientStockException ex,
            WebRequest request) {
        logger.warn("Insufficient stock error: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus("INSUFFICIENT_STOCK");
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Handle resource not found errors (e.g., product not found, order not found)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(
            ResourceNotFoundException ex,
            WebRequest request) {
        logger.warn("Resource not found: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus("NOT_FOUND");
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle user-related errors (e.g., user not found in JWT context)
     */
    @ExceptionHandler(UserException.class)
    public ResponseEntity<ApiResponse> handleUserException(
            UserException ex,
            WebRequest request) {
        logger.warn("User error: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus("USER_ERROR");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle invalid operations (e.g., invalid state transitions)
     */
    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiResponse> handleInvalidOperation(
            InvalidOperationException ex,
            WebRequest request) {
        logger.warn("Invalid operation: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle payment failures (e.g., M-Pesa API errors, invalid payment)
     */
    @ExceptionHandler(PaymentFailedException.class)
    public ResponseEntity<ApiResponse> handlePaymentFailed(
            PaymentFailedException ex,
            WebRequest request) {
        logger.error("Payment failed: {} (Method: {})", ex.getMessage(), ex.getPaymentMethod());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.PAYMENT_REQUIRED);
    }

    /**
     * Handle unauthorized access (e.g., invalid JWT, expired token)
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnauthorized(
            UnauthorizedException ex,
            WebRequest request) {
        logger.warn("Unauthorized access attempt: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle validation errors (e.g., field validation failures)
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse> handleValidation(
            ValidationException ex,
            WebRequest request) {
        logger.warn("Validation error: {}", ex.getMessage());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus(ex.getErrorCode());
        response.setFieldErrors(ex.getFieldErrors());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle duplicate resource errors (e.g., user with same email already exists)
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse> handleDuplicateResource(
            DuplicateResourceException ex,
            WebRequest request) {
        logger.warn("Duplicate resource: {} - field: {}", ex.getResourceType(), ex.getDuplicateField());
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        response.setStatus(ex.getErrorCode());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Handle validation errors from @Valid annotation on request bodies
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            WebRequest request) {
        logger.warn("Method argument validation failed");
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult()
           .getFieldErrors()
           .forEach(error -> errors.put(
              error.getField(),
              error.getDefaultMessage()
           ));

        ApiResponse response = new ApiResponse(
            false,
            "Validation failed",
            "VALIDATION_FAILED"
        );
        response.setFieldErrors(errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Fallback for RuntimeException
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntime(
            RuntimeException ex,
            WebRequest request) {
        logger.error("Unexpected runtime error", ex);
        ApiResponse response = new ApiResponse(false, "An unexpected error occurred");
        response.setStatus("INTERNAL_ERROR");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Fallback for any other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneric(
            Exception ex,
            WebRequest request) {
        logger.error("Unexpected error", ex);
        ApiResponse response = new ApiResponse(false, "An unexpected error occurred");
        response.setStatus("ERROR");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

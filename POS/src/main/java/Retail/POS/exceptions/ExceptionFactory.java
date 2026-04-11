package Retail.POS.exceptions;

/**
 * Utility class for common exception creation patterns
 * Provides factory methods for consistent exception instantiation across the application
 */
public class ExceptionFactory {

    /**
     * Create insufficient stock exception with details
     */
    public static InsufficientStockException insufficientStock(
            String productName,
            int required,
            int available) {
        return new InsufficientStockException(
            String.format(
                "Insufficient stock for %s. Required: %d, Available: %d",
                productName, required, available
            ),
            productName,
            required,
            available
        );
    }

    /**
     * Create resource not found exception
     */
    public static ResourceNotFoundException notFound(String resourceType, Long id) {
        return new ResourceNotFoundException(
            String.format("%s with ID %d not found", resourceType, id)
        );
    }

    public static ResourceNotFoundException notFound(String resourceType, String identifier) {
        return new ResourceNotFoundException(
            String.format("%s with identifier '%s' not found", resourceType, identifier)
        );
    }

    /**
     * Create duplicate resource exception
     */
    public static DuplicateResourceException duplicate(
            String resourceType,
            String fieldName,
            String value) {
        return new DuplicateResourceException(
            String.format("%s with %s '%s' already exists", resourceType, fieldName, value),
            resourceType,
            fieldName
        );
    }

    /**
     * Create invalid operation exception with specific code
     */
    public static InvalidOperationException invalidOperation(
            String operation,
            String reason,
            String errorCode) {
        return new InvalidOperationException(
            String.format("Cannot %s: %s", operation, reason),
            errorCode
        );
    }

    /**
     * Create validation exception with field error
     */
    public static ValidationException validation(String field, String errorMessage) {
        ValidationException ex = new ValidationException("Validation failed");
        ex.addFieldError(field, errorMessage);
        return ex;
    }

    /**
     * Create payment failed exception
     */
    public static PaymentFailedException paymentFailed(
            String paymentMethod,
            String reason,
            String errorCode) {
        return new PaymentFailedException(
            String.format("%s payment failed: %s", paymentMethod, reason),
            errorCode,
            paymentMethod
        );
    }

    /**
     * Create unauthorized exception with specific code
     */
    public static UnauthorizedException unauthorized(String reason, String errorCode) {
        return new UnauthorizedException(reason, errorCode);
    }
}

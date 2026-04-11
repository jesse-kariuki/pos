package Retail.POS.exceptions;

/**
 * Exception for duplicate resource creation attempts
 * e.g., creating a user with existing email
 */
public class DuplicateResourceException extends RuntimeException {

    private String errorCode;
    private String resourceType;
    private String duplicateField;

    public DuplicateResourceException(String message) {
        super(message);
        this.errorCode = "DUPLICATE_RESOURCE";
    }

    public DuplicateResourceException(String message, String resourceType, String duplicateField) {
        super(message);
        this.errorCode = "DUPLICATE_RESOURCE";
        this.resourceType = resourceType;
        this.duplicateField = duplicateField;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getDuplicateField() {
        return duplicateField;
    }
}

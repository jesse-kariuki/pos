package Retail.POS.exceptions;

/**
 * Exception for invalid business operations
 * e.g., trying to cancel an already completed order, refund validation failures
 */
public class InvalidOperationException extends RuntimeException {

    private String errorCode;

    public InvalidOperationException(String message) {
        super(message);
        this.errorCode = "INVALID_OPERATION";
    }

    public InvalidOperationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

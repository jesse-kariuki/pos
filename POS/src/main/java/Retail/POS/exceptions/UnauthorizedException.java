package Retail.POS.exceptions;

/**
 * Exception for unauthorized access attempts
 * e.g., JWT invalid, expired token, insufficient permissions
 */
public class UnauthorizedException extends RuntimeException {

    private String errorCode;

    public UnauthorizedException(String message) {
        super(message);
        this.errorCode = "UNAUTHORIZED";
    }

    public UnauthorizedException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

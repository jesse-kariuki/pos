package Retail.POS.exceptions;

/**
 * Exception for payment processing failures
 * e.g., M-Pesa API failures, invalid payment method
 */
public class PaymentFailedException extends RuntimeException {

    private String errorCode;
    private String paymentMethod;

    public PaymentFailedException(String message) {
        super(message);
        this.errorCode = "PAYMENT_FAILED";
    }

    public PaymentFailedException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public PaymentFailedException(String message, String errorCode, String paymentMethod) {
        super(message);
        this.errorCode = errorCode;
        this.paymentMethod = paymentMethod;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }
}

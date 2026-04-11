package Retail.POS.exceptions;

/**
 * Exception thrown when trying to process more items than available stock
 * e.g., selling items when insufficient quantity available
 */
public class InsufficientStockException extends RuntimeException {

    private String errorCode;
    private String productName;
    private int requiredQuantity;
    private int availableQuantity;

    public InsufficientStockException() {
        super("Insufficient stock available");
        this.errorCode = "INSUFFICIENT_STOCK";
    }

    public InsufficientStockException(String message) {
        super(message);
        this.errorCode = "INSUFFICIENT_STOCK";
    }

    public InsufficientStockException(String message, String productName, int requiredQuantity, int availableQuantity) {
        super(message);
        this.errorCode = "INSUFFICIENT_STOCK";
        this.productName = productName;
        this.requiredQuantity = requiredQuantity;
        this.availableQuantity = availableQuantity;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getProductName() {
        return productName;
    }

    public int getRequiredQuantity() {
        return requiredQuantity;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }
}

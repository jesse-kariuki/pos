package Retail.POS.service;

/**
 * REFERENCE DOCUMENTATION - Pseudocode Examples Only
 * 
 * This is NOT compiled code. It shows patterns for exception handling in your services.
 * Copy these patterns into your actual service classes:
 * - InventoryService
 * - OrderService
 * - ProductService
 * - PurchaseService
 * 
 * See EXCEPTION_HANDLING.md for full documentation and examples.
 * 
 * ============================================================================
 * EXAMPLE 1: Validate stock before deducting
 * ============================================================================
 * 
 * public void deductStock(Product product, int quantityRequested) {
 *     // Validate stock
 *     if (product.getQuantity() < quantityRequested) {
 *         throw ExceptionFactory.insufficientStock(
 *             product.getName(),
 *             quantityRequested,
 *             product.getQuantity()
 *         );
 *     }
 *     // Deduct stock
 *     product.setQuantity(product.getQuantity() - quantityRequested);
 * }
 * 
 * ============================================================================
 * EXAMPLE 2: Find resource or throw exception
 * ============================================================================
 * 
 * public Product getProductById(Long productId) {
 *     return productRepository.findById(productId)
 *         .orElseThrow(() -> ExceptionFactory.notFound("Product", productId));
 * }
 * 
 * ============================================================================
 * EXAMPLE 3: Check for duplicates
 * ============================================================================
 * 
 * public void createUser(String email, String name) {
 *     if (userRepository.existsByEmail(email)) {
 *         throw ExceptionFactory.duplicate("User", "email", email);
 *     }
 *     // Create user...
 * }
 * 
 * ============================================================================
 * EXAMPLE 4: Validate input with multiple field errors
 * ============================================================================
 * 
 * public void validateOrderInput(String email, int quantity, double price) {
 *     ValidationException ex = new ValidationException("Order validation failed");
 *     
 *     if (email == null || email.isEmpty()) {
 *         ex.addFieldError("email", "Email is required");
 *     } else if (!email.contains("@")) {
 *         ex.addFieldError("email", "Email format is invalid");
 *     }
 *     
 *     if (quantity <= 0) {
 *         ex.addFieldError("quantity", "Quantity must be greater than 0");
 *     }
 *     
 *     if (price < 0) {
 *         ex.addFieldError("price", "Price cannot be negative");
 *     }
 *     
 *     // Throw if any errors accumulated
 *     if (!ex.getFieldErrors().isEmpty()) {
 *         throw ex;
 *     }
 * }
 * 
 * ============================================================================
 * EXAMPLE 5: Check invalid state transition
 * ============================================================================
 * 
 * public void cancelOrder(Order order) {
 *     if (!order.getStatus().equals(OrderStatus.PENDING)) {
 *         throw ExceptionFactory.invalidOperation(
 *             "cancel order",
 *             "Order is in " + order.getStatus() + " status",
 *             "CANNOT_CANCEL_ORDER"
 *         );
 *     }
 *     // Cancel order...
 *     order.setStatus(OrderStatus.CANCELLED);
 * }
 * 
 * ============================================================================
 * EXAMPLE 6: Handle payment processing failure
 * ============================================================================
 * 
 * public void processPayment(String phoneNumber) {
 *     MpesaResponse response = mpesaProvider.initiateStkPush(phoneNumber);
 *     
 *     if (!response.isSuccessful()) {
 *         throw ExceptionFactory.paymentFailed(
 *             "M-Pesa",
 *             response.getErrorMessage(),
 *             "MPESA_" + response.getErrorCode()
 *         );
 *     }
 *     // Process successful payment...
 * }
 * 
 * ============================================================================
 * EXAMPLE 7: Validate authorization
 * ============================================================================
 * 
 * public void validateUserHasAccess(String jwtToken, String requiredRole) {
 *     if (!jwtValidator.isValid(jwtToken)) {
 *         throw ExceptionFactory.unauthorized(
 *             "Invalid or expired JWT token",
 *             "INVALID_TOKEN"
 *         );
 *     }
 *     
 *     String userRole = jwtValidator.extractRole(jwtToken);
 *     if (!userRole.equals(requiredRole)) {
 *         throw ExceptionFactory.unauthorized(
 *             "User does not have required role: " + requiredRole,
 *             "INSUFFICIENT_PERMISSIONS"
 *         );
 *     }
 * }
 * 
 * ============================================================================
 * EXAMPLE 8: Complex business logic with multiple exception types
 * ============================================================================
 * 
 * public void createOrder(Order order, String paymentMethod) {
 *     // Validate order exists
 *     if (order == null) {
 *         throw ExceptionFactory.notFound("Order", 0L);
 *     }
 *     
 *     // Validate items
 *     ValidationException ex = new ValidationException("Order validation failed");
 *     
 *     if (order.getItems() == null || order.getItems().isEmpty()) {
 *         ex.addFieldError("items", "Order must have at least one item");
 *     }
 *     
 *     for (OrderItem item : order.getItems()) {
 *         Product product = productRepository.findById(item.getProductId())
 *             .orElseThrow(() -> ExceptionFactory.notFound("Product", item.getProductId()));
 *         
 *         if (product.getQuantity() < item.getQuantity()) {
 *             ex.addFieldError(
 *                 "item_" + product.getId(),
 *                 "Insufficient stock for " + product.getName()
 *             );
 *         }
 *     }
 *     
 *     if (!ex.getFieldErrors().isEmpty()) {
 *         throw ex;
 *     }
 *     
 *     // Process payment
 *     if ("MPESA".equals(paymentMethod)) {
 *         MpesaResponse response = mpesaProvider.initiateStkPush(order.getCustomerPhone());
 *         if (!response.isSuccessful()) {
 *             throw ExceptionFactory.paymentFailed(
 *                 "M-Pesa",
 *                 response.getErrorMessage(),
 *                 "MPESA_INIT_FAILED"
 *             );
 *         }
 *     }
 *     
 *     // Deduct stock
 *     for (OrderItem item : order.getItems()) {
 *         Product product = productRepository.findById(item.getProductId()).get();
 *         product.setQuantity(product.getQuantity() - item.getQuantity());
 *     }
 *     
 *     order.setStatus(OrderStatus.COMPLETED);
 * }
 * 
 * ============================================================================
 * KEY PATTERNS
 * ============================================================================
 * 
 * 1. STOCK VALIDATION
 *    if (product.getQuantity() < needed) {
 *        throw ExceptionFactory.insufficientStock(name, needed, available);
 *    }
 * 
 * 2. FIND OR FAIL
 *    Product p = repo.findById(id)
 *        .orElseThrow(() -> ExceptionFactory.notFound("Product", id));
 * 
 * 3. DUPLICATE CHECK
 *    if (repo.existsByEmail(email)) {
 *        throw ExceptionFactory.duplicate("User", "email", email);
 *    }
 * 
 * 4. ACCUMULATE VALIDATION ERRORS
 *    ValidationException ex = new ValidationException("Validation failed");
 *    if (condition1) ex.addFieldError("field1", "error1");
 *    if (condition2) ex.addFieldError("field2", "error2");
 *    if (!ex.getFieldErrors().isEmpty()) throw ex;
 * 
 * 5. STATE VALIDATION
 *    if (!validState) {
 *        throw ExceptionFactory.invalidOperation("action", "reason", "CODE");
 *    }
 * 
 * 6. PAYMENT ERROR HANDLING
 *    if (!paymentResponse.success()) {
 *        throw ExceptionFactory.paymentFailed("M-Pesa", error, "CODE");
 *    }
 * 
 * 7. AUTHORIZATION CHECK
 *    if (!isAuthorized) {
 *        throw ExceptionFactory.unauthorized("message", "CODE");
 *    }
 * 
 * ============================================================================
 */
public class ExceptionHandlingExamples {
    // This is a documentation class - see comments above for patterns
    // Do NOT instantiate this class
}

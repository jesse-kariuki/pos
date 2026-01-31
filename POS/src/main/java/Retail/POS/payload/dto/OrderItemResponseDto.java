package Retail.POS.payload.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponseDto {
    private Long productId;
    private String productName;
    private Double quantity;
    private Double unitPrice;
    private Double subtotal;
}

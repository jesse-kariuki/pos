package Retail.POS.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private Double quantityBought;
    private String unit;
    private Double totalCost;
    private Double costPerUnit;  // totalCost / quantityBought — useful for display
    private String notes;
    private LocalDateTime createdAt;
}
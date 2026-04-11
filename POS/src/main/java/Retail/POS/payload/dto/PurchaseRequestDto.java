package Retail.POS.payload.dto;

import lombok.Data;

@Data
public class PurchaseRequestDto {
    private Long productId;
    private Double quantityBought;
    private String unit;
    private Double totalCost;
    private String notes;
}
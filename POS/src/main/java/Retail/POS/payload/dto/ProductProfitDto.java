package Retail.POS.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductProfitDto {
    private Long productId;
    private String productName;
    private String productCode;

    private Double totalCost;       // sum of all purchase costs
    private Double totalRevenue;    // sum of all sales revenue
    private Double profit;          // totalRevenue - totalCost
    private Double marginPercent;   // (profit / totalRevenue) * 100

    private Double totalBought;     // total quantity bought (in purchase unit)
    private String buyingUnit;      // unit used when buying e.g. "kg"

    private Double totalSold;       // total quantity sold (in selling unit)
    private String sellingUnit;     // unit used when selling e.g. "pieces"

    private boolean isLossMaking;   // profit < 0
}
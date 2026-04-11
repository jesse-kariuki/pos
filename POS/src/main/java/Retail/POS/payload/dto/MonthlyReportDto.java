package Retail.POS.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportDto {
    private String month;               // e.g. "March 2026"
    private Double totalRevenue;        // total earned from sales
    private Double totalCost;           // total spent on purchases
    private Double netProfit;           // revenue - cost
    private Double overallMargin;       // (netProfit / totalRevenue) * 100

    private List<ProductProfitDto> productBreakdown;  // per product
    private List<ProductProfitDto> topPerformers;     // top 5 by profit
    private List<ProductProfitDto> lossMakers;        // all products where profit < 0
}
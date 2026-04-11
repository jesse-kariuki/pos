package Retail.POS.service.impl;

import Retail.POS.domain.OrderStatus;
import Retail.POS.models.OrderItem;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.MonthlyReportDto;
import Retail.POS.payload.dto.ProductProfitDto;
import Retail.POS.repository.OrderRepository;
import Retail.POS.repository.ProductRepository;
import Retail.POS.repository.PurchaseRepository;
import Retail.POS.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;

    @Override
    public MonthlyReportDto getMonthlyReport(int year, int month) {

        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);

        // Get all products
        List<Product> products = productRepository.findAll();

        // Build profit breakdown per product
        List<ProductProfitDto> breakdown = products.stream()
                .map(product -> buildProductProfit(product, start, end))
                .filter(dto -> dto.getTotalCost() > 0 || dto.getTotalRevenue() > 0) // skip untouched products
                .sorted(Comparator.comparingDouble(ProductProfitDto::getProfit).reversed())
                .collect(Collectors.toList());

        double totalRevenue = breakdown.stream().mapToDouble(ProductProfitDto::getTotalRevenue).sum();
        double totalCost = breakdown.stream().mapToDouble(ProductProfitDto::getTotalCost).sum();
        double netProfit = totalRevenue - totalCost;
        double overallMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        List<ProductProfitDto> topPerformers = breakdown.stream()
                .filter(p -> p.getProfit() > 0)
                .limit(5)
                .collect(Collectors.toList());

        List<ProductProfitDto> lossMakers = breakdown.stream()
                .filter(ProductProfitDto::isLossMaking)
                .collect(Collectors.toList());

        String monthLabel = LocalDate.of(year, month, 1)
                .format(DateTimeFormatter.ofPattern("MMMM yyyy"));

        return MonthlyReportDto.builder()
                .month(monthLabel)
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .netProfit(netProfit)
                .overallMargin(overallMargin)
                .productBreakdown(breakdown)
                .topPerformers(topPerformers)
                .lossMakers(lossMakers)
                .build();
    }

    @Override
    public List<ProductProfitDto> getAllTimeProfit() {
        // Use epoch start to now for all-time
        LocalDateTime start = LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.now();

        return productRepository.findAll().stream()
                .map(product -> buildProductProfit(product, start, end))
                .filter(dto -> dto.getTotalCost() > 0 || dto.getTotalRevenue() > 0)
                .sorted(Comparator.comparingDouble(ProductProfitDto::getProfit).reversed())
                .collect(Collectors.toList());
    }

    // Core profit calculation per product for a date range
    private ProductProfitDto buildProductProfit(Product product, LocalDateTime start, LocalDateTime end) {

        // Total cost: sum of all purchases for this product in range
        double totalCost = purchaseRepository
                .sumTotalCostByProductAndDateRange(product, start, end);

        // Total revenue: sum of all order items for this product in range
        double totalRevenue = orderRepository
                .findByCreatedAtBetween(start, end)
                .stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .flatMap(order -> order.getOrderItems().stream())
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        // Total quantity sold
        double totalSold = orderRepository
                .findByCreatedAtBetween(start, end)
                .stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .flatMap(order -> order.getOrderItems().stream())
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .mapToDouble(OrderItem::getQuantity)
                .sum();

        // Total quantity bought
        double totalBought = purchaseRepository
                .findByProductAndCreatedAtBetween(product, start, end)
                .stream()
                .mapToDouble(p -> p.getQuantityBought())
                .sum();

        // Get the most recent purchase unit for display
        String buyingUnit = purchaseRepository
                .findByProductAndCreatedAtBetween(product, start, end)
                .stream()
                .max(Comparator.comparing(p -> p.getCreatedAt()))
                .map(p -> p.getUnit())
                .orElse("units");

        double profit = totalRevenue - totalCost;
        double margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return ProductProfitDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productCode(product.getCode())
                .totalCost(totalCost)
                .totalRevenue(totalRevenue)
                .profit(profit)
                .marginPercent(margin)
                .totalBought(totalBought)
                .buyingUnit(buyingUnit)
                .totalSold(totalSold)
                .sellingUnit(product.getType().equals("WEIGHED") ? "kg" : "pcs")
                .isLossMaking(profit < 0)
                .build();
    }
}
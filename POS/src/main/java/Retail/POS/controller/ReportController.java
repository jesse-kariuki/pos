package Retail.POS.controller;

import Retail.POS.payload.dto.MonthlyReportDto;
import Retail.POS.payload.dto.ProductProfitDto;
import Retail.POS.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // GET /api/reports/monthly?year=2026&month=3
    // Returns full monthly report: summary + per product breakdown
    @GetMapping("/monthly")
    public ResponseEntity<MonthlyReportDto> getMonthlyReport(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {

        // Default to current month if not specified
        if (year == 0) year = LocalDate.now().getYear();
        if (month == 0) month = LocalDate.now().getMonthValue();

        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }

    // GET /api/reports/profit — all-time profit per product
    @GetMapping("/profit")
    public ResponseEntity<List<ProductProfitDto>> getAllTimeProfit() {
        return ResponseEntity.ok(reportService.getAllTimeProfit());
    }
}
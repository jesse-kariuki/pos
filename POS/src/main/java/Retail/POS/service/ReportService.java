package Retail.POS.service;

import Retail.POS.payload.dto.MonthlyReportDto;
import Retail.POS.payload.dto.ProductProfitDto;

import java.util.List;

public interface ReportService {
    MonthlyReportDto getMonthlyReport(int year, int month);
    List<ProductProfitDto> getAllTimeProfit();
}
package Retail.POS.service;

import Retail.POS.payload.dto.PurchaseRequestDto;
import Retail.POS.payload.dto.PurchaseResponseDto;

import java.util.List;

public interface PurchaseService {
    PurchaseResponseDto createPurchase(PurchaseRequestDto request);
    List<PurchaseResponseDto> getAllPurchases();
    List<PurchaseResponseDto> getPurchasesByMonth(int year, int month);
}
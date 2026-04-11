package Retail.POS.controller;

import Retail.POS.payload.dto.PurchaseRequestDto;
import Retail.POS.payload.dto.PurchaseResponseDto;
import Retail.POS.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    // POST /api/purchases — log a new restock (also updates inventory automatically)
    @PostMapping
    public ResponseEntity<PurchaseResponseDto> createPurchase(@RequestBody PurchaseRequestDto request) {
        return ResponseEntity.ok(purchaseService.createPurchase(request));
    }

    // GET /api/purchases — get all purchase history
    @GetMapping
    public ResponseEntity<List<PurchaseResponseDto>> getAllPurchases() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    // GET /api/purchases/monthly?year=2026&month=3 — purchases for a specific month
    @GetMapping("/monthly")
    public ResponseEntity<List<PurchaseResponseDto>> getPurchasesByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(purchaseService.getPurchasesByMonth(year, month));
    }
}
package Retail.POS.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Retail.POS.exceptions.ResourceNotFoundException;
import Retail.POS.mapper.PurchaseMapper;
import Retail.POS.models.Inventory;
import Retail.POS.models.Product;
import Retail.POS.models.Purchase;
import Retail.POS.payload.dto.PurchaseRequestDto;
import Retail.POS.payload.dto.PurchaseResponseDto;
import Retail.POS.repository.InventoryRepository;
import Retail.POS.repository.ProductRepository;
import Retail.POS.repository.PurchaseRepository;
import Retail.POS.service.PurchaseService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public PurchaseResponseDto createPurchase(PurchaseRequestDto request) {

        // 1. Find the product
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        // 2. Save the purchase record (for cost/profit tracking)
        Purchase purchase = Purchase.builder()
            .product(product)
            .quantityBought(request.getQuantityBought())
            .unit(request.getUnit())
            .totalCost(request.getTotalCost())
            .notes(request.getNotes())
            .createdAt(request.getPurchaseDateTime())
            .build();

        purchaseRepository.save(purchase);

        // 3. Automatically increment inventory stock
        Inventory inventory = inventoryRepository.findByProduct(product)
            .orElseThrow(() -> new ResourceNotFoundException("No inventory found for product: " + product.getName()));
        inventory.setQuantity(inventory.getQuantity() + request.getQuantityBought());
        inventoryRepository.save(inventory);

        return PurchaseMapper.toDto(purchase);
    }

    @Override
    public List<PurchaseResponseDto> getAllPurchases() {
        return purchaseRepository.findAll()
                .stream()
                .map(PurchaseMapper::toDto)
                .toList();
    }

    @Override
    public List<PurchaseResponseDto> getPurchasesByMonth(int year, int month) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);

        return purchaseRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(PurchaseMapper::toDto)
                .toList();
    }
}
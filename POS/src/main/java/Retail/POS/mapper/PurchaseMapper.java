package Retail.POS.mapper;

import Retail.POS.models.Purchase;
import Retail.POS.payload.dto.PurchaseResponseDto;

public class PurchaseMapper {

    public static PurchaseResponseDto toDto(Purchase purchase) {
        double costPerUnit = purchase.getQuantityBought() > 0
                ? purchase.getTotalCost() / purchase.getQuantityBought()
                : 0;

        return PurchaseResponseDto.builder()
                .id(purchase.getId())
                .productId(purchase.getProduct().getId())
                .productName(purchase.getProduct().getName())
                .productCode(purchase.getProduct().getCode())
                .quantityBought(purchase.getQuantityBought())
                .unit(purchase.getUnit())
                .totalCost(purchase.getTotalCost())
                .costPerUnit(costPerUnit)
                .notes(purchase.getNotes())
                .createdAt(purchase.getCreatedAt())
                .build();
    }
}
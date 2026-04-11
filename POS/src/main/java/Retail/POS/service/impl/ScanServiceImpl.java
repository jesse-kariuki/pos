package Retail.POS.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

import Retail.POS.domain.ProductType;
import Retail.POS.exceptions.ResourceNotFoundException;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.CartItemDto;
import Retail.POS.repository.ProductRepository;
import Retail.POS.service.ScanService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScanServiceImpl implements ScanService {

    private final ProductRepository productRepository;

    @Override
    public CartItemDto handleScan(String barcode) {
        if (barcode.length() == 13 && barcode.startsWith("20")) {
            return handleWeighedBarcode(barcode);
        }


        return handleFixedBarcode(barcode);
    }

    private CartItemDto handleWeighedBarcode(String barcode) {
        String plu = barcode.substring(2, 7);
        double totalFromBarcode = Integer.parseInt(barcode.substring(7, 12)) / 100.0;

        Product product = productRepository.findByCode(plu)                  .orElseThrow(() -> new ResourceNotFoundException("PLU " + plu + " not found in system"));            if (product.getType() != ProductType.WEIGHED) {              throw new ResourceNotFoundException("Product " + product.getName() + " is not set as a WEIGHED item.");          }
        double rawWeight = totalFromBarcode / product.getSellingPrice();

        double weight = BigDecimal.valueOf(rawWeight)
                .setScale(3, RoundingMode.HALF_UP)
                .doubleValue();

        return CartItemDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getCode())
                .unitPrice(product.getSellingPrice())
                .quantity(weight)
                .total(totalFromBarcode)
                .build();
    }

    private CartItemDto handleFixedBarcode(String barcode) {
        Product product = productRepository.findByCode(barcode)                  .orElseThrow(() -> new ResourceNotFoundException("Barcode " + barcode + " not recognized"));            return CartItemDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getCode())
                .unitPrice(product.getSellingPrice())
                .quantity(1.0)
                .total(product.getSellingPrice())
                .build();
    }
}
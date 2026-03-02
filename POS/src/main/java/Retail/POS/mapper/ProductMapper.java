package Retail.POS.mapper;

import Retail.POS.models.Product;
import Retail.POS.payload.dto.ProductDto;
public class ProductMapper {

    public static ProductDto toDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .code(product.getCode())
                .description(product.getDescription())
                .sellingPrice(product.getSellingPrice())
                .type(product.getType())
                .pricePerKg(product.getPricePerKg())
                .image(product.getImage())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static Product toEntity(ProductDto productDto) {
        return Product.builder()
                .id(productDto.getId()) // Added ID for updates
                .name(productDto.getName())
                .code(productDto.getCode())
                .description(productDto.getDescription())
                .sellingPrice(productDto.getSellingPrice())
                .type(productDto.getType())
                .pricePerKg(productDto.getPricePerKg())
                .image(productDto.getImage())
                .build();
    }
}
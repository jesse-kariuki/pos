package Retail.POS.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import Retail.POS.domain.ProductType;
import Retail.POS.exceptions.ResourceNotFoundException;
import Retail.POS.mapper.ProductMapper;
import Retail.POS.models.Product;
import Retail.POS.models.User;
import Retail.POS.payload.dto.ProductDto;
import Retail.POS.repository.ProductRepository;
import Retail.POS.service.ProductService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private static final String UPLOAD_DIR = "uploads/products/";

    public ProductDto uploadProductImage(Long productId, MultipartFile file)
            throws IOException {

        Product product = productRepository.findById(productId)                  .orElseThrow(() -> new ResourceNotFoundException("Product not found"));            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + filename);

        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        product.setImage("/products/images/" + filename);
        productRepository.save(product);

        return ProductMapper.toDto(product);
    }
    @Override
    public ProductDto createProduct(ProductDto productDto, User user) {
        Product product = ProductMapper.toEntity(productDto);

        if (product.getType() == ProductType.FIXED && product.getSellingPrice() == null) {
            throw new IllegalStateException("Fixed product must have selling price");
        }

        if (product.getType() == ProductType.WEIGHED && product.getPricePerKg() == null) {
            throw new IllegalStateException("Weighed product must have price per kg");
        }
        Product savedProduct = productRepository.save(product);

        return ProductMapper.toDto(savedProduct);
    }

    @Override
    public ProductDto updateProduct(Long id, ProductDto productDto, User user) throws Exception {

        Product product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found")          );
        product.setName(productDto.getName());
        product.setCode(productDto.getCode());
        product.setDescription(productDto.getDescription());
        product.setSellingPrice(productDto.getSellingPrice());
        product.setType(productDto.getType());
        product.setImage(productDto.getImage());
        product.setUpdatedAt(productDto.getUpdatedAt());
        product.setPricePerKg(productDto.getPricePerKg());
        Product updatedProduct = productRepository.save(product);


        return ProductMapper.toDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id, User user) throws Exception {

        Product product = productRepository.findById(id).orElseThrow(
                () -> new Exception("Product not found")
        );

    }

    @Override
    public List<ProductDto> getAllProducts(User user) {

           return productRepository.findAll()
                .stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    @Override
    public List<ProductDto> searchByKeyword(String keyword) {
        List<Product> products = productRepository.searchByKeyword(keyword);

        return products.stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }
}

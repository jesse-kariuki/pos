package Retail.POS.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import Retail.POS.exceptions.ResourceNotFoundException;
import Retail.POS.mapper.InventoryMapper;
import Retail.POS.models.Inventory;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.InventoryRequestDto;
import Retail.POS.payload.dto.InventoryResponseDto;
import Retail.POS.repository.InventoryRepository;
import Retail.POS.repository.ProductRepository;
import Retail.POS.service.InventoryService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Override
    public InventoryResponseDto createInventory(InventoryRequestDto request) throws Exception {
        Product product = productRepository.findById(request.getProductId())                  .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));            if (inventoryRepository.existsByProduct(product)) {              throw new IllegalStateException(                      "Inventory already exists for product: " + product.getName()              );          }

        Inventory inventory = Inventory.builder().
                product(product).
                quantity(request.getQuantity()).
                build();
        Inventory savedInventory = inventoryRepository.save(inventory);
        return InventoryMapper.toResponseDto(savedInventory);




    }

    @Override
    public InventoryResponseDto updateInventory(Long id, InventoryRequestDto request) throws Exception {
        Inventory inventory = inventoryRepository.findById(id).orElseThrow(                  ()-> new ResourceNotFoundException("Inventory not found with id: " + id)          );
        inventory.setQuantity(request.getQuantity());
        Inventory savedInventory = inventoryRepository.save(inventory);

        return InventoryMapper.toResponseDto(savedInventory);
    }

    @Override
    public void deleteInventory(Long id) throws Exception {


        Inventory inventory = inventoryRepository.findById(id).orElseThrow(
                ()-> new Exception("Inventory not found with id: " + id)
        );
        inventoryRepository.delete(inventory);

    }

    @Override
    public InventoryResponseDto getInventoryById(Long id) throws Exception {
        Inventory inventory = inventoryRepository.findById(id).orElseThrow(
                ()-> new Exception("Inventory not found with id: " + id)
        );
        return InventoryMapper.toResponseDto(inventory);
    }

    @Override
    public InventoryResponseDto getInventoryByProductSku(String sku) throws Exception {
         Inventory inventory = inventoryRepository.findByProduct_Code(sku).orElseThrow(                   ()-> new ResourceNotFoundException("Inventory not found with code: " + sku)                       );
            return InventoryMapper.toResponseDto(inventory);
    }

    @Override
    public List<InventoryResponseDto> getAllInventory() {
        return inventoryRepository.findAll().
                stream().
                map(InventoryMapper::toResponseDto).
                collect(Collectors.toList());
    }
}

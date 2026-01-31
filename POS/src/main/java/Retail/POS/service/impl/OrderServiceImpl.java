package Retail.POS.service.impl;

import Retail.POS.domain.OrderStatus;
import Retail.POS.exceptions.InsufficientStockException;
import Retail.POS.mapper.OrderMapper;
import Retail.POS.models.Inventory;
import Retail.POS.models.Order;
import Retail.POS.models.OrderItem;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.OrderItemRequestDto;
import Retail.POS.payload.dto.OrderRequestDto;
import Retail.POS.payload.dto.OrderResponseDto;
import Retail.POS.payload.dto.TopProductDto;
import Retail.POS.repository.InventoryRepository;
import Retail.POS.repository.OrderRepository;
import Retail.POS.repository.ProductRepository;
import Retail.POS.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public OrderResponseDto createOrder(OrderRequestDto request) {

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (OrderItemRequestDto item : request.getOrderItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException("Product not found: " + item.getProductId())
                    );

            Inventory inventory = inventoryRepository.findByProduct(product)
                    .orElseThrow(() ->
                            new RuntimeException("No inventory for product: " + product.getName())
                    );

            if (inventory.getQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for " + product.getName() +
                                ". Available: " + inventory.getQuantity()
                );

            }

            inventory.setQuantity(
                    inventory.getQuantity() - item.getQuantity()
            );

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getSellingPrice())
                    .build();

            orderItems.add(orderItem);
            total += product.getSellingPrice() * item.getQuantity();
        }

        Order order = Order.builder()
                .orderItems(orderItems)
                .totalAmount(total)
                .status(OrderStatus.COMPLETED) // Set to COMPLETED for POS
                .createdAt(LocalDateTime.now()) // Ensure timestamp is set
                .paymentMethod(request.getPaymentMethod()) // Don't forget to save the method!
                .build();

        orderItems.forEach(i -> i.setOrder(order));

        Order savedOrder = orderRepository.save(order);

        return OrderMapper.toDto(savedOrder);
    }

    @Override
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderMapper::toDto)
                .toList();
    }


    @Override
    public List<OrderResponseDto> getOrdersByDate(LocalDate start, LocalDate end) {

        return orderRepository.findByCreatedAtBetween(
                        start.atStartOfDay(),
                        end.atTime(23, 59, 59)
                )
                .stream()
                .map(OrderMapper::toDto)
                .toList();
    }


    @Override
    public Double getTodaySalesTotal() {

        LocalDate today = LocalDate.now();

        return orderRepository.findByCreatedAtBetween(
                        today.atStartOfDay(),
                        today.atTime(23, 59, 59)
                )
                .stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }


    @Override
    public List<OrderResponseDto> getOrdersByStatus(OrderStatus status) {

        return orderRepository.findByStatus(status)
                .stream()
                .map(OrderMapper::toDto)
                .toList();
    }

    @Override
    public Double getMonthlySalesTotal() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);

        return orderRepository.findAll().stream()
                .filter(order -> !order.getCreatedAt().isBefore(startOfMonth.atStartOfDay()))
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

    @Override
    public List<TopProductDto> getTopSellingProducts() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .flatMap(order -> order.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProduct().getName(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    double totalQty = list.stream().mapToDouble(OrderItem::getQuantity).sum();
                                    double totalRev = list.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
                                    return new TopProductDto("", totalQty, totalRev);
                                }
                        )
                ))
                .entrySet().stream()
                .map(entry -> {
                    TopProductDto dto = entry.getValue();
                    dto.setName(entry.getKey());
                    return dto;
                })
                .sorted((a, b) -> b.getQuantitySold().compareTo(a.getQuantitySold()))
                .limit(5) // Get top 5
                .collect(Collectors.toList());
    }
}

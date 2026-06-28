package Retail.POS.payload.dto;

import Retail.POS.domain.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderRequestDto {

    private PaymentMethod paymentMethod;

    private LocalDateTime saleDateTime;

    private List<OrderItemRequestDto> orderItems;
}

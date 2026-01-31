package Retail.POS.payload.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemRequestDto {

    @NotNull
    private Long productId;

    private Double quantity;

}

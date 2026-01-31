package Retail.POS.payload.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryResponseDto {

    private Long id;
    private ProductDto product;
    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private Double quantity;

}

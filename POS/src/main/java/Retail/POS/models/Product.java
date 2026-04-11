    package Retail.POS.models;

    import Retail.POS.domain.ProductType;
    import jakarta.persistence.*;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.time.LocalDateTime;

    @Entity
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public class Product {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        @Column(nullable = false, unique = true)
        private String code;

        private String description;


        private Double sellingPrice;

        private String image;

        @Enumerated(EnumType.STRING)
        private ProductType type;
        private Double pricePerKg;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        @PrePersist
        protected void onCreate(){
            this.createdAt = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate(){
            this.updatedAt = LocalDateTime.now();
        }

    }

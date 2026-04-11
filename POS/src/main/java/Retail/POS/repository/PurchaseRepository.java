package Retail.POS.repository;

import Retail.POS.models.Product;
import Retail.POS.models.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByProduct(Product product);

    List<Purchase> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Purchase> findByProductAndCreatedAtBetween(
            Product product,
            LocalDateTime start,
            LocalDateTime end
    );

    // Sum total cost for a product within a date range
    @Query("SELECT COALESCE(SUM(p.totalCost), 0) FROM Purchase p " +
            "WHERE p.product = :product " +
            "AND p.createdAt BETWEEN :start AND :end")
    Double sumTotalCostByProductAndDateRange(
            @Param("product") Product product,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // Sum total cost for all products within a date range
    @Query("SELECT COALESCE(SUM(p.totalCost), 0) FROM Purchase p " +
            "WHERE p.createdAt BETWEEN :start AND :end")
    Double sumTotalCostByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
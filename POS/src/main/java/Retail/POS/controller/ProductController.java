package Retail.POS.controller;

import Retail.POS.exceptions.UserException;
import Retail.POS.models.User;
import Retail.POS.payload.dto.ProductDto;
import Retail.POS.payload.response.ApiResponse;
import Retail.POS.service.ProductService;
import Retail.POS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final UserService userService;




    @PostMapping("/create")
    public ResponseEntity<ProductDto> create(@RequestBody ProductDto productDto,
                                             @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(productService.createProduct(productDto, user));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductDto> update(
            @PathVariable Long id,
            @RequestBody ProductDto productDto,
            @RequestHeader("Authorization") String jwt) throws Exception, UserException {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(productService.updateProduct(id, productDto, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) throws Exception, UserException {
        User user = userService.getUserFromJwtToken(jwt);
        productService.deleteProduct(id, user);
        ApiResponse response = new ApiResponse();
        response.setMessage("Product deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}/image")
    public ResponseEntity<ProductDto> uploadImage (
            @PathVariable Long productId,
            @RequestParam("image") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(
                productService.uploadProductImage(productId, file)
        );
    }


    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchByKeyword(
            @RequestParam String keyword
            ) throws UserException{

        return ResponseEntity.ok(productService.searchByKeyword(keyword));

    }

}

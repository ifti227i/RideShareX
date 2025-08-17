package com.ridesharex.controller;

import com.ridesharex.model.PaymentMethod;
import com.ridesharex.model.Transaction;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethod>> getPaymentMethods() {
        // TODO: Implement payment methods retrieval
        return ResponseEntity.ok().build();
    }

    @PostMapping("/methods")
    public ResponseEntity<PaymentMethod> addPaymentMethod(@RequestBody PaymentMethod paymentMethod) {
        // TODO: Implement payment method addition
        return ResponseEntity.ok().build();
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory() {
        // TODO: Implement transaction history retrieval
        return ResponseEntity.ok().build();
    }

    @PostMapping("/process")
    public ResponseEntity<Transaction> processPayment(@RequestBody Transaction transaction) {
        // TODO: Implement payment processing
        return ResponseEntity.ok().build();
    }
}

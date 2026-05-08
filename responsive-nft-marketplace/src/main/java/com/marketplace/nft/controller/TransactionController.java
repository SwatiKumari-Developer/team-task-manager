package com.marketplace.nft.controller;

import com.marketplace.nft.dto.MarketplaceDtos.TransactionResponse;
import com.marketplace.nft.model.User;
import com.marketplace.nft.service.AuthService;
import com.marketplace.nft.service.MarketplaceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final MarketplaceService marketplace;
    private final AuthService auth;

    public TransactionController(MarketplaceService marketplace, AuthService auth) {
        this.marketplace = marketplace;
        this.auth = auth;
    }

    @GetMapping
    public List<TransactionResponse> mine(@RequestHeader(value = "Authorization", required = false) String authorization) {
        User user = auth.requireUser(authorization);
        return marketplace.transactionsFor(user);
    }
}

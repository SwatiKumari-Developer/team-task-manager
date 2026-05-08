package com.marketplace.nft.controller;

import com.marketplace.nft.dto.MarketplaceDtos.BidRequest;
import com.marketplace.nft.dto.MarketplaceDtos.BidResponse;
import com.marketplace.nft.dto.MarketplaceDtos.CreateNftRequest;
import com.marketplace.nft.dto.MarketplaceDtos.NftResponse;
import com.marketplace.nft.dto.MarketplaceDtos.TransactionResponse;
import com.marketplace.nft.model.NftStatus;
import com.marketplace.nft.model.User;
import com.marketplace.nft.service.AuthService;
import com.marketplace.nft.service.MarketplaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/nfts")
public class NftController {
    private final MarketplaceService marketplace;
    private final AuthService auth;

    public NftController(MarketplaceService marketplace, AuthService auth) {
        this.marketplace = marketplace;
        this.auth = auth;
    }

    @GetMapping
    public List<NftResponse> search(@RequestParam(required = false) String category,
                                    @RequestParam(required = false) NftStatus status,
                                    @RequestParam(required = false) String q) {
        return marketplace.search(category, status, q);
    }

    @GetMapping("/{id}")
    public NftResponse find(@PathVariable Long id) {
        return marketplace.find(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NftResponse create(@Valid @RequestBody CreateNftRequest request,
                              @RequestHeader(value = "Authorization", required = false) String authorization) {
        User user = auth.requireUser(authorization);
        return marketplace.create(request, user);
    }

    @PostMapping("/{id}/bids")
    @ResponseStatus(HttpStatus.CREATED)
    public BidResponse bid(@PathVariable Long id,
                           @Valid @RequestBody BidRequest request,
                           @RequestHeader(value = "Authorization", required = false) String authorization) {
        User user = auth.requireUser(authorization);
        return marketplace.bid(id, request.amount(), user);
    }

    @GetMapping("/{id}/bids")
    public List<BidResponse> bids(@PathVariable Long id) {
        return marketplace.bidHistory(id);
    }

    @PostMapping("/{id}/buy")
    public TransactionResponse buy(@PathVariable Long id,
                                   @RequestHeader(value = "Authorization", required = false) String authorization) {
        User user = auth.requireUser(authorization);
        return marketplace.buy(id, user);
    }
}

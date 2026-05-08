package com.marketplace.nft.dto;

import com.marketplace.nft.model.NftStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public final class MarketplaceDtos {
    private MarketplaceDtos() {
    }

    public record CreateNftRequest(
            @NotBlank @Size(max = 120) String title,
            @NotBlank @Size(max = 80) String category,
            @NotBlank @Size(max = 600) String description,
            @NotBlank String imageUrl,
            @NotNull @DecimalMin("0.01") BigDecimal price
    ) {
    }

    public record NftResponse(
            Long id,
            String title,
            String category,
            String description,
            String imageUrl,
            BigDecimal price,
            BigDecimal highestBid,
            NftStatus status,
            String owner,
            Instant createdAt
    ) {
    }

    public record BidRequest(@NotNull @DecimalMin("0.01") BigDecimal amount) {
    }

    public record BidResponse(Long id, Long nftId, String bidder, BigDecimal amount, Instant createdAt) {
    }

    public record TransactionResponse(Long id, Long nftId, String nftTitle, String buyer, String seller,
                                      BigDecimal amount, Instant createdAt) {
    }
}

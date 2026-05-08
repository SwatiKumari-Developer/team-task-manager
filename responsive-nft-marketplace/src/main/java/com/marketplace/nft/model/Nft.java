package com.marketplace.nft.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "nfts", indexes = {
        @Index(name = "idx_nfts_status_category", columnList = "status, category"),
        @Index(name = "idx_nfts_title", columnList = "title")
})
public class Nft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 600)
    private String description;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal highestBid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NftStatus status = NftStatus.LISTED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Nft() {
    }

    public Nft(String title, String category, String description, String imageUrl, BigDecimal price, User owner) {
        this.title = title;
        this.category = category;
        this.description = description;
        this.imageUrl = imageUrl;
        this.price = price;
        this.highestBid = price;
        this.owner = owner;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getHighestBid() {
        return highestBid;
    }

    public NftStatus getStatus() {
        return status;
    }

    public User getOwner() {
        return owner;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void updateHighestBid(BigDecimal amount) {
        this.highestBid = amount;
    }

    public void markSold(User newOwner, BigDecimal salePrice) {
        this.owner = newOwner;
        this.price = salePrice;
        this.highestBid = salePrice;
        this.status = NftStatus.SOLD;
    }
}

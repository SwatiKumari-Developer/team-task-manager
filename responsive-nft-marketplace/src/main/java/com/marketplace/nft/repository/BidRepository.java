package com.marketplace.nft.repository;

import com.marketplace.nft.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findTop10ByNftIdOrderByCreatedAtDesc(Long nftId);
}

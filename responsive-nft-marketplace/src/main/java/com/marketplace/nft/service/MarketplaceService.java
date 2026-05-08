package com.marketplace.nft.service;

import com.marketplace.nft.dto.MarketplaceDtos.BidResponse;
import com.marketplace.nft.dto.MarketplaceDtos.CreateNftRequest;
import com.marketplace.nft.dto.MarketplaceDtos.NftResponse;
import com.marketplace.nft.dto.MarketplaceDtos.TransactionResponse;
import com.marketplace.nft.exception.ApiException;
import com.marketplace.nft.model.Bid;
import com.marketplace.nft.model.Nft;
import com.marketplace.nft.model.NftStatus;
import com.marketplace.nft.model.TransactionRecord;
import com.marketplace.nft.model.User;
import com.marketplace.nft.repository.BidRepository;
import com.marketplace.nft.repository.NftRepository;
import com.marketplace.nft.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MarketplaceService {
    private final NftRepository nfts;
    private final BidRepository bids;
    private final TransactionRepository transactions;

    public MarketplaceService(NftRepository nfts, BidRepository bids, TransactionRepository transactions) {
        this.nfts = nfts;
        this.bids = bids;
        this.transactions = transactions;
    }

    @Transactional
    public NftResponse create(CreateNftRequest request, User owner) {
        Nft nft = nfts.save(new Nft(request.title(), request.category(), request.description(),
                request.imageUrl(), request.price(), owner));
        return toResponse(nft);
    }

    public List<NftResponse> search(String category, NftStatus status, String query) {
        String normalizedCategory = StringUtils.hasText(category) && !"All".equalsIgnoreCase(category) ? category : null;
        String normalizedQuery = StringUtils.hasText(query) ? query : null;
        return nfts.search(normalizedCategory, status, normalizedQuery).stream().map(this::toResponse).toList();
    }

    public NftResponse find(Long id) {
        return toResponse(getNft(id));
    }

    @Transactional
    public BidResponse bid(Long nftId, BigDecimal amount, User bidder) {
        Nft nft = getNft(nftId);
        if (nft.getStatus() == NftStatus.SOLD) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This NFT has already been sold");
        }
        if (nft.getOwner().getId().equals(bidder.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Owners cannot bid on their own NFT");
        }
        if (amount.compareTo(nft.getHighestBid()) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Bid must be higher than the current highest bid");
        }
        Bid bid = bids.save(new Bid(nft, bidder, amount));
        nft.updateHighestBid(amount);
        return toResponse(bid);
    }

    public List<BidResponse> bidHistory(Long nftId) {
        return bids.findTop10ByNftIdOrderByCreatedAtDesc(nftId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public TransactionResponse buy(Long nftId, User buyer) {
        Nft nft = getNft(nftId);
        if (nft.getStatus() == NftStatus.SOLD) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This NFT has already been sold");
        }
        if (nft.getOwner().getId().equals(buyer.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Owners cannot buy their own NFT");
        }

        User seller = nft.getOwner();
        BigDecimal salePrice = nft.getHighestBid();
        nft.markSold(buyer, salePrice);
        TransactionRecord transaction = transactions.save(new TransactionRecord(nft, buyer, seller, salePrice));
        return toResponse(transaction);
    }

    public List<TransactionResponse> transactionsFor(User user) {
        return transactions.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(user.getId(), user.getId())
                .stream().map(this::toResponse).toList();
    }

    private Nft getNft(Long id) {
        return nfts.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NFT not found"));
    }

    private NftResponse toResponse(Nft nft) {
        return new NftResponse(nft.getId(), nft.getTitle(), nft.getCategory(), nft.getDescription(),
                nft.getImageUrl(), nft.getPrice(), nft.getHighestBid(), nft.getStatus(),
                nft.getOwner().getUsername(), nft.getCreatedAt());
    }

    private BidResponse toResponse(Bid bid) {
        return new BidResponse(bid.getId(), bid.getNft().getId(), bid.getBidder().getUsername(), bid.getAmount(), bid.getCreatedAt());
    }

    private TransactionResponse toResponse(TransactionRecord transaction) {
        return new TransactionResponse(transaction.getId(), transaction.getNft().getId(),
                transaction.getNft().getTitle(), transaction.getBuyer().getUsername(),
                transaction.getSeller().getUsername(), transaction.getAmount(), transaction.getCreatedAt());
    }
}

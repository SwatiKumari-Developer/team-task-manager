package com.marketplace.nft.config;

import com.marketplace.nft.dto.AuthDtos.RegisterRequest;
import com.marketplace.nft.dto.MarketplaceDtos.CreateNftRequest;
import com.marketplace.nft.model.User;
import com.marketplace.nft.repository.NftRepository;
import com.marketplace.nft.repository.UserRepository;
import com.marketplace.nft.service.AuthService;
import com.marketplace.nft.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {
    private final boolean seedDemoData;
    private final UserRepository users;
    private final NftRepository nfts;
    private final AuthService auth;
    private final MarketplaceService marketplace;

    public DataSeeder(@Value("${app.seed-demo-data:true}") boolean seedDemoData,
                      UserRepository users,
                      NftRepository nfts,
                      AuthService auth,
                      MarketplaceService marketplace) {
        this.seedDemoData = seedDemoData;
        this.users = users;
        this.nfts = nfts;
        this.auth = auth;
        this.marketplace = marketplace;
    }

    @Override
    public void run(String... args) {
        if (!seedDemoData || users.count() > 0 || nfts.count() > 0) {
            return;
        }

        auth.register(new RegisterRequest("artist_arya", "arya@example.com", "password123"));
        auth.register(new RegisterRequest("collector_neo", "neo@example.com", "password123"));
        User arya = users.findByEmail("arya@example.com").orElseThrow();

        marketplace.create(new CreateNftRequest("Solar Bloom", "Art",
                "A luminous generative floral piece inspired by solar flares.",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
                new BigDecimal("2.40")), arya);
        marketplace.create(new CreateNftRequest("Neon Drift", "Collectible",
                "A cyber collectible with chrome textures and animated city energy.",
                "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=900&q=80",
                new BigDecimal("1.75")), arya);
        marketplace.create(new CreateNftRequest("Monsoon Memory", "Photography",
                "A cinematic rain-soaked city frame minted as a limited NFT.",
                "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
                new BigDecimal("3.10")), arya);
    }
}

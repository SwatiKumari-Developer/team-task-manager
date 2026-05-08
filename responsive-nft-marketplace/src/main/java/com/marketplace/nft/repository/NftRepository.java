package com.marketplace.nft.repository;

import com.marketplace.nft.model.Nft;
import com.marketplace.nft.model.NftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NftRepository extends JpaRepository<Nft, Long> {

    @Query("""
            select n from Nft n
            where (:category is null or lower(n.category) = lower(:category))
              and (:status is null or n.status = :status)
              and (:search is null or lower(n.title) like lower(concat('%', :search, '%'))
                   or lower(n.description) like lower(concat('%', :search, '%')))
            order by n.createdAt desc
            """)
    List<Nft> search(@Param("category") String category,
                     @Param("status") NftStatus status,
                     @Param("search") String search);
}

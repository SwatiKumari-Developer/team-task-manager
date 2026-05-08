# Responsive NFT Marketplace

This project is a full-stack NFT marketplace built from scratch with Java, Spring Boot, REST APIs, JPA/Hibernate, MySQL-ready persistence, and a responsive HTML/CSS/JavaScript frontend.

## What This Project Includes

- User registration, login, logout, and token-based authentication.
- NFT listing creation with title, category, image URL, price, and description.
- Search, category filter, and status filter for marketplace listings.
- Bidding flow with validation that each bid is higher than the current highest bid.
- Buy-now flow that marks the NFT as sold and stores a transaction record.
- Transaction history for the logged-in user.
- Layered backend structure: controllers, services, repositories, DTOs, entities, and exception handling.
- JPA indexes on listing search, bids, and transactions.
- Responsive frontend served by Spring Boot from `src/main/resources/static`.

## Step-by-Step Build Explanation

### 1. Project Skeleton

I created a Maven Spring Boot project in `responsive-nft-marketplace`.

Important files:

- `pom.xml`: declares Spring Boot, Spring Web, Spring Data JPA, Validation, H2, MySQL connector, and tests.
- `NftMarketplaceApplication.java`: starts the Spring Boot app.
- `application.properties`: local demo database configuration.
- `application-mysql.properties`: MySQL configuration profile.

### 2. Database Models

The backend uses JPA entities:

- `User`: stores username, email, salted password hash, and creation time.
- `AuthToken`: stores bearer tokens for authenticated sessions.
- `Nft`: stores NFT listing data, owner, status, price, and highest bid.
- `Bid`: stores bid amount, bidder, NFT, and timestamp.
- `TransactionRecord`: stores buyer, seller, NFT, sale amount, and timestamp.

### 3. Repository Layer

Repositories extend `JpaRepository`, so Spring Data generates common database operations automatically.

Custom queries include:

- Search NFTs by category, status, title, or description.
- Fetch recent bids for an NFT.
- Fetch transactions where a user is buyer or seller.

### 4. Service Layer

Business logic lives in services instead of controllers.

- `AuthService`: handles register, login, logout, token lookup, and current user validation.
- `PasswordService`: creates salts and hashes passwords.
- `MarketplaceService`: handles listing, searching, bidding, buying, and transaction history.

### 5. REST Controllers

The REST API follows simple resource-based routes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login and receive token |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/logout` | Delete current token |
| `GET` | `/api/nfts` | Search/list NFTs |
| `GET` | `/api/nfts/{id}` | Get NFT details |
| `POST` | `/api/nfts` | Create NFT listing |
| `POST` | `/api/nfts/{id}/bids` | Place bid |
| `GET` | `/api/nfts/{id}/bids` | View bid history |
| `POST` | `/api/nfts/{id}/buy` | Buy NFT |
| `GET` | `/api/transactions` | Current user's transaction history |

Protected endpoints require:

```http
Authorization: Bearer your-token
```

### 6. Frontend

The frontend is plain HTML/CSS/JavaScript:

- `index.html`: page structure and modals.
- `styles.css`: responsive layout and visual styling.
- `app.js`: calls REST APIs, stores login token, renders cards, handles filters, bids, purchases, and transactions.

## How To Run

From this folder:

```bash
cd responsive-nft-marketplace
mvn spring-boot:run
```

Then open:

```text
http://localhost:8080
```

Seeded demo account:

```text
Email: arya@example.com
Password: password123
```

Another seeded account:

```text
Email: neo@example.com
Password: password123
```

## MySQL Setup

The project runs with H2 by default so you can test immediately. To use MySQL:

1. Create or allow the app to create a database named `nft_marketplace`.
2. Edit `src/main/resources/application-mysql.properties`.
3. Set your MySQL username and password.
4. Run:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

## Useful Test Requests

Register:

```bash
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"student\",\"email\":\"student@example.com\",\"password\":\"password123\"}"
```

Create NFT:

```bash
curl -X POST http://localhost:8080/api/nfts ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"title\":\"Pixel Moon\",\"category\":\"Art\",\"description\":\"Limited digital artwork\",\"imageUrl\":\"https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=900&q=80\",\"price\":1.25}"
```

## Notes For Resume Explanation

You can describe the project like this:

Built a responsive NFT marketplace using Java, Spring Boot, REST APIs, JPA/Hibernate, and MySQL-ready persistence. Implemented user authentication, NFT listing, search/filtering, bidding, purchase transactions, and transaction history with a layered MVC architecture. Designed a responsive HTML/CSS/JavaScript frontend and connected it to JSON REST endpoints.

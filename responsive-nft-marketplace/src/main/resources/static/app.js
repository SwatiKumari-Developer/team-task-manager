const state = {
    token: localStorage.getItem("mintlaneToken"),
    user: JSON.parse(localStorage.getItem("mintlaneUser") || "null"),
    authMode: "login",
    nfts: []
};

const els = {
    authButton: document.querySelector("#authButton"),
    logoutButton: document.querySelector("#logoutButton"),
    transactionsButton: document.querySelector("#transactionsButton"),
    authModal: document.querySelector("#authModal"),
    authForm: document.querySelector("#authForm"),
    authTitle: document.querySelector("#authTitle"),
    usernameField: document.querySelector("#usernameField"),
    usernameInput: document.querySelector("#usernameInput"),
    emailInput: document.querySelector("#emailInput"),
    passwordInput: document.querySelector("#passwordInput"),
    toggleAuthMode: document.querySelector("#toggleAuthMode"),
    listingModal: document.querySelector("#listingModal"),
    listingForm: document.querySelector("#listingForm"),
    detailModal: document.querySelector("#detailModal"),
    detailContent: document.querySelector("#detailContent"),
    transactionsModal: document.querySelector("#transactionsModal"),
    transactionList: document.querySelector("#transactionList"),
    nftGrid: document.querySelector("#nftGrid"),
    emptyState: document.querySelector("#emptyState"),
    searchInput: document.querySelector("#searchInput"),
    categorySelect: document.querySelector("#categorySelect"),
    statusSelect: document.querySelector("#statusSelect"),
    toast: document.querySelector("#toast")
};

function authHeaders() {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }
    return response.json();
}

function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.add("hidden"), 3200);
}

function formatEth(value) {
    return `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`;
}

function setSession(authResponse) {
    state.token = authResponse.token;
    state.user = authResponse.user;
    localStorage.setItem("mintlaneToken", state.token);
    localStorage.setItem("mintlaneUser", JSON.stringify(state.user));
    renderSession();
}

function clearSession() {
    state.token = null;
    state.user = null;
    localStorage.removeItem("mintlaneToken");
    localStorage.removeItem("mintlaneUser");
    renderSession();
}

function renderSession() {
    if (state.user) {
        els.authButton.textContent = state.user.username;
        els.logoutButton.classList.remove("hidden");
    } else {
        els.authButton.textContent = "Sign in";
        els.logoutButton.classList.add("hidden");
    }
}

function openModal(dialog) {
    if (!dialog.open) {
        dialog.showModal();
    }
}

function closeModal(dialog) {
    if (dialog.open) {
        dialog.close();
    }
}

function requireLogin() {
    if (state.token) {
        return true;
    }
    openModal(els.authModal);
    showToast("Please sign in first");
    return false;
}

async function loadNfts() {
    const params = new URLSearchParams();
    if (els.categorySelect.value !== "All") {
        params.set("category", els.categorySelect.value);
    }
    if (els.statusSelect.value) {
        params.set("status", els.statusSelect.value);
    }
    if (els.searchInput.value.trim()) {
        params.set("q", els.searchInput.value.trim());
    }

    state.nfts = await api(`/api/nfts?${params.toString()}`);
    renderNfts();
}

function renderNfts() {
    els.nftGrid.innerHTML = state.nfts.map(nft => `
        <article class="nft-card">
            <img src="${escapeHtml(nft.imageUrl)}" alt="${escapeHtml(nft.title)}">
            <div class="nft-card-body">
                <div class="card-meta">
                    <span class="pill">${escapeHtml(nft.category)}</span>
                    <span class="pill ${nft.status === "SOLD" ? "sold" : ""}">${nft.status}</span>
                </div>
                <div>
                    <h3>${escapeHtml(nft.title)}</h3>
                    <p class="muted">${escapeHtml(nft.description)}</p>
                </div>
                <div class="price-row">
                    <span class="muted">Highest bid</span>
                    <span class="price">${formatEth(nft.highestBid)}</span>
                </div>
                <button class="ghost-button" type="button" data-view="${nft.id}">View details</button>
            </div>
        </article>
    `).join("");
    els.emptyState.classList.toggle("hidden", state.nfts.length > 0);
}

async function openDetails(id) {
    const nft = await api(`/api/nfts/${id}`);
    const bids = await api(`/api/nfts/${id}/bids`);
    els.detailContent.innerHTML = `
        <div class="detail-layout">
            <img src="${escapeHtml(nft.imageUrl)}" alt="${escapeHtml(nft.title)}">
            <div>
                <span class="pill ${nft.status === "SOLD" ? "sold" : ""}">${nft.status}</span>
                <h2>${escapeHtml(nft.title)}</h2>
                <p class="muted">${escapeHtml(nft.description)}</p>
                <div class="price-row">
                    <span>Owner</span>
                    <strong>${escapeHtml(nft.owner)}</strong>
                </div>
                <div class="price-row">
                    <span>Highest bid</span>
                    <strong>${formatEth(nft.highestBid)}</strong>
                </div>
                <form class="bid-form" id="bidForm">
                    <input id="bidAmount" type="number" min="0.01" step="0.01" placeholder="Bid amount" required>
                    <button class="secondary-button" type="submit">Place bid</button>
                </form>
                <button class="primary-button full-button" id="buyButton" type="button">Buy now</button>
                <h3>Recent bids</h3>
                <div class="history-list">
                    ${bids.length ? bids.map(bid => `
                        <div class="history-row">
                            <span>${escapeHtml(bid.bidder)}</span>
                            <strong>${formatEth(bid.amount)}</strong>
                        </div>`).join("") : "<p class=\"muted\">No bids yet.</p>"}
                </div>
            </div>
        </div>
    `;
    openModal(els.detailModal);

    document.querySelector("#bidForm").addEventListener("submit", async event => {
        event.preventDefault();
        if (!requireLogin()) {
            return;
        }
        const amount = document.querySelector("#bidAmount").value;
        await api(`/api/nfts/${id}/bids`, { method: "POST", body: JSON.stringify({ amount }) });
        showToast("Bid placed successfully");
        await loadNfts();
        await openDetails(id);
    });

    document.querySelector("#buyButton").addEventListener("click", async () => {
        if (!requireLogin()) {
            return;
        }
        await api(`/api/nfts/${id}/buy`, { method: "POST" });
        showToast("NFT purchased successfully");
        closeModal(els.detailModal);
        await loadNfts();
    });
}

async function loadTransactions() {
    if (!requireLogin()) {
        return;
    }
    const rows = await api("/api/transactions");
    els.transactionList.innerHTML = rows.length ? rows.map(row => `
        <div class="history-row">
            <div>
                <strong>${escapeHtml(row.nftTitle)}</strong>
                <p class="muted">Buyer: ${escapeHtml(row.buyer)} | Seller: ${escapeHtml(row.seller)}</p>
            </div>
            <strong>${formatEth(row.amount)}</strong>
        </div>
    `).join("") : "<p class=\"muted\">No transactions yet.</p>";
    openModal(els.transactionsModal);
}

function setAuthMode(mode) {
    state.authMode = mode;
    const isRegister = mode === "register";
    els.authTitle.textContent = isRegister ? "Create account" : "Sign in";
    els.usernameField.classList.toggle("hidden", !isRegister);
    els.usernameInput.required = isRegister;
    els.toggleAuthMode.textContent = isRegister ? "Already have an account? Sign in" : "Need an account? Register";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("click", async event => {
    const closeTarget = event.target.dataset.close;
    if (closeTarget) {
        closeModal(document.querySelector(`#${closeTarget}`));
    }

    const nftId = event.target.dataset.view;
    if (nftId) {
        await openDetails(nftId);
    }
});

els.authButton.addEventListener("click", () => openModal(els.authModal));
els.transactionsButton.addEventListener("click", loadTransactions);
els.logoutButton.addEventListener("click", async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => null);
    clearSession();
    showToast("Logged out");
});

document.querySelector("#listButton").addEventListener("click", () => requireLogin() && openModal(els.listingModal));
document.querySelector("#listHeroButton").addEventListener("click", () => requireLogin() && openModal(els.listingModal));
document.querySelector("#exploreButton").addEventListener("click", () => document.querySelector("#market").scrollIntoView({ behavior: "smooth" }));

els.toggleAuthMode.addEventListener("click", () => setAuthMode(state.authMode === "login" ? "register" : "login"));

els.authForm.addEventListener("submit", async event => {
    event.preventDefault();
    const body = state.authMode === "register"
        ? { username: els.usernameInput.value.trim(), email: els.emailInput.value.trim(), password: els.passwordInput.value }
        : { email: els.emailInput.value.trim(), password: els.passwordInput.value };
    const response = await api(`/api/auth/${state.authMode}`, { method: "POST", body: JSON.stringify(body) });
    setSession(response);
    closeModal(els.authModal);
    showToast(state.authMode === "register" ? "Account created" : "Signed in");
    els.authForm.reset();
});

els.listingForm.addEventListener("submit", async event => {
    event.preventDefault();
    const body = {
        title: document.querySelector("#titleInput").value.trim(),
        category: document.querySelector("#newCategoryInput").value,
        imageUrl: document.querySelector("#imageInput").value.trim(),
        price: document.querySelector("#priceInput").value,
        description: document.querySelector("#descriptionInput").value.trim()
    };
    await api("/api/nfts", { method: "POST", body: JSON.stringify(body) });
    closeModal(els.listingModal);
    els.listingForm.reset();
    showToast("NFT listing published");
    await loadNfts();
});

[els.searchInput, els.categorySelect, els.statusSelect].forEach(element => {
    element.addEventListener("input", () => loadNfts().catch(error => showToast(error.message)));
});

window.addEventListener("unhandledrejection", event => {
    showToast(event.reason?.message || "Something went wrong");
});

renderSession();
setAuthMode("login");
loadNfts().catch(error => showToast(error.message));

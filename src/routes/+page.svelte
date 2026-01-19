<script>
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";

    let { data } = $props();
    let searchTerm = $state("");

    // Filter players (excluding the one in active auction)
    let filteredPlayers = $derived(
        data.players.filter(
            (p) =>
                (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
                p.id !== data.auction?.playerId,
        ),
    );

    // Timer Logic
    let timeLeft = $state(data.auction?.remainingTime || 0);
    let timerInterval;

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (data.auction.status === "ACTIVE") {
                // Calculate local countdown based on end time relative to now
                // But for simplicity, we rely on server sync or simple decrement
                // Let's use simple decrement for UI smoothness, but rely on data re-fetch for truth
                timeLeft = Math.max(0, timeLeft - 1);

                if (timeLeft === 0) {
                    // Trigger end
                    // We can submit a hidden form or just let the user see "Time's up"
                    // Ideally we auto-submit endAuction, but browsers block auto-submit sometimes.
                    // We will just show "Processing..." and invalidate
                    invalidateAll();
                }
            }
        }, 1000);
    }

    $effect(() => {
        timeLeft = data.auction?.remainingTime || 0;
        if (data.auction.status === "ACTIVE") {
            startTimer();
        } else {
            clearInterval(timerInterval);
        }
    });

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
    });

    // Auto-refresh every 2 seconds to check for other bidders
    onMount(() => {
        const poller = setInterval(() => {
            if (data.auction.status === "ACTIVE") {
                invalidateAll();
            }
        }, 2000);
        return () => clearInterval(poller);
    });
</script>

<div class="container">
    <!-- Active Auction Hero Section -->
    {#if data.auction.status === "ACTIVE" && data.auction.player}
        <div class="glass-card active-auction">
            <div class="auction-header">
                <div class="live-badge">🔴 LIVE AUCTION</div>
                <div class="timer {timeLeft < 10 ? 'danger-time' : ''}">
                    {timeLeft}s
                </div>
            </div>

            <div class="auction-content">
                <div class="player-info-large">
                    <div class="player-avatar large">
                        {data.auction.player.name.charAt(0)}
                    </div>
                    <div style="text-align: left;">
                        <h1>{data.auction.player.name}</h1>
                        <span class="badge" style="font-size: 1rem;"
                            >{data.auction.player.role}</span
                        >
                        <p style="margin-top: 0.5rem; opacity: 0.7;">
                            Base Price: ₹ {data.auction.player.basePrice} L
                        </p>
                    </div>
                </div>

                <div class="bidding-arena">
                    <div class="current-stats">
                        <p class="label">Current Highest Bid</p>
                        <div class="price-large">
                            ₹ {data.auction.currentBid} L
                        </div>
                        <p class="bidder-name">
                            {data.auction.highestBidder
                                ? `Held by: ${data.auction.highestBidder}`
                                : "No bids yet"}
                        </p>
                    </div>

                    {#if timeLeft > 0}
                        <form
                            method="POST"
                            action="?/placeBid"
                            use:enhance
                            class="bid-form"
                        >
                            <input
                                type="text"
                                name="bidderName"
                                placeholder="Your Name"
                                required
                                class="input-field"
                            />
                            <input
                                type="number"
                                name="amount"
                                placeholder="Amount"
                                min={data.auction.currentBid + 1}
                                value={data.auction.currentBid + 10}
                                required
                                class="input-field bid-amount"
                            />
                            <button type="submit" class="btn">Place Bid</button>
                        </form>
                    {:else}
                        <form method="POST" action="?/endAuction" use:enhance>
                            <button class="btn btn-danger" style="width: 100%"
                                >Finalize Sale</button
                            >
                        </form>
                    {/if}
                </div>
            </div>

            {#if data.auction.history.length > 0}
                <div class="bid-ticker">
                    <small>Recent Bids:</small>
                    {#each data.auction.history
                        .slice()
                        .reverse()
                        .slice(0, 3) as bid}
                        <span class="ticker-item"
                            >{bid.name}: ₹{bid.amount}</span
                        >
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; margin-top: 2rem;"
    >
        <h1>Auction Arena</h1>
        <div>
            <a
                href="/admin/login"
                class="btn"
                style="background: transparent; border: 1px solid var(--glass-border);"
                >Admin Login</a
            >
        </div>
    </div>

    <!-- Search/Filter -->
    <div style="margin-bottom: 2rem;">
        <input
            type="text"
            placeholder="Search players by name or role..."
            class="input-field"
            bind:value={searchTerm}
            style="max-width: 400px;"
        />

        <!-- Quick Start for Demo purposes (Only shows if no active auction) -->
        {#if data.auction.status === "IDLE"}
            <p style="margin-top: 1rem; opacity: 0.5; font-size: 0.9rem;">
                <span style="color: var(--secondary);">Demo Mode:</span> Click "Start
                Auction" on any unsold player to begin live bidding.
            </p>
        {/if}
    </div>

    <div class="players-grid">
        {#each filteredPlayers as player}
            <div class="glass-card player-card">
                <div class="player-avatar">
                    {player.name.charAt(0)}
                </div>
                <h3>{player.name}</h3>
                <div class="badge-container">
                    <span
                        class="badge"
                        style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc;"
                        >{player.role}</span
                    >
                    <span
                        class="badge {player.status === 'Sold'
                            ? 'badge-sold'
                            : 'badge-unsold'}">{player.status}</span
                    >
                </div>

                {#if player.status === "Sold"}
                    <div class="sold-info">
                        <p>Sold to {player.team}</p>
                        <p class="sold-price">₹ {player.soldPrice} L</p>
                    </div>
                {:else}
                    <div class="price-info">
                        <p>Base Price</p>
                        <p class="price">₹ {player.basePrice} L</p>
                    </div>

                    {#if data.auction.status === "IDLE"}
                        <form
                            method="POST"
                            action="?/startAuction"
                            use:enhance
                            style="margin-top: 1rem; width: 100%;"
                        >
                            <input
                                type="hidden"
                                name="playerId"
                                value={player.id}
                            />
                            <button
                                class="btn"
                                style="width: 100%; font-size: 0.9rem; padding: 0.5rem;"
                                >Start Auction</button
                            >
                        </form>
                    {/if}
                {/if}
            </div>
        {/each}
        {#if filteredPlayers.length === 0}
            <p style="opacity: 0.7; grid-column: 1 / -1; text-align: center;">
                No players found matching "{searchTerm}"
            </p>
        {/if}
    </div>
</div>

<style>
    .active-auction {
        border: 2px solid var(--primary);
        background: rgba(30, 41, 59, 0.8);
        animation: pulse 2s infinite;
        margin-bottom: 3rem;
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        }
    }

    .auction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
    }

    .live-badge {
        background: #ef4444;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.8rem;
        letter-spacing: 0.1em;
        animation: blink 1s infinite;
    }
    @keyframes blink {
        50% {
            opacity: 0.5;
        }
    }

    .timer {
        font-size: 2rem;
        font-weight: 800;
        font-family: monospace;
    }
    .danger-time {
        color: #ef4444;
    }

    .auction-content {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
    }

    .player-info-large {
        flex: 1;
        min-width: 250px;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .player-avatar.large {
        width: 100px;
        height: 100px;
        font-size: 3rem;
    }

    .bidding-arena {
        flex: 1;
        min-width: 300px;
        background: rgba(0, 0, 0, 0.2);
        padding: 1.5rem;
        border-radius: 12px;
    }

    .current-stats {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .price-large {
        font-size: 3rem;
        font-weight: 800;
        color: var(--success);
        line-height: 1;
        margin: 0.5rem 0;
    }
    .bidder-name {
        font-size: 0.9rem;
        color: #94a3b8;
    }

    .bid-form {
        display: flex;
        gap: 0.5rem;
    }

    .bid-amount {
        width: 100px !important;
    }

    .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
    }
    .player-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: transform 0.3s;
        padding: 2rem 1.5rem;
    }
    .player-card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.08);
    }
    .player-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 1rem;
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        color: white;
    }
    .badge-container {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }
    .price-info,
    .sold-info {
        background: rgba(0, 0, 0, 0.2);
        padding: 0.75rem;
        border-radius: 8px;
        width: 100%;
    }
    .sold-info {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .price-info p:first-child,
    .sold-info p:first-child {
        font-size: 0.8rem;
        opacity: 0.7;
        margin-bottom: 0.25rem;
    }
    .price {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
    }
    .sold-price {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--success);
    }
    .bid-ticker {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 1rem;
        overflow: hidden;
    }
    .ticker-item {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
    }
</style>

<script>
    let { data } = $props();
</script>

<div class="container">
    <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;"
    >
        <h1>Admin Dashboard</h1>
        <div>
            <a href="/admin/players/add" class="btn">Add New Player</a>
            <a
                href="/"
                class="btn"
                style="background: transparent; border: 1px solid var(--glass-border); margin-left: 1rem;"
                >View Public Site</a
            >
        </div>
    </div>

    <div class="glass-card">
        <h2>Player List</h2>
        <div style="overflow-x: auto;">
            {#if data.players.length === 0}
                <p style="opacity: 0.7; padding: 1rem;">No players found.</p>
            {:else}
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Base Price (Lakhs)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.players as player}
                            <tr>
                                <td style="font-weight: 500;">{player.name}</td>
                                <td>{player.role}</td>
                                <td>₹ {player.basePrice}</td>
                                <td>
                                    <span
                                        class="badge {player.status === 'Sold'
                                            ? 'badge-sold'
                                            : 'badge-unsold'}"
                                    >
                                        {player.status}
                                    </span>
                                </td>
                                <td>
                                    <a
                                        href="/admin/players/{player.id}/edit"
                                        style="color: var(--accent); margin-right: 1rem;"
                                        >Edit</a
                                    >
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    </div>
</div>

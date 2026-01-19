<script>
    import { enhance } from "$app/forms";
</script>

<div class="container">
    <a
        href="/admin/dashboard"
        style="margin-bottom: 2rem; display: inline-block;"
        >&larr; Back to Dashboard</a
    >
    <h1>Add New Player</h1>

    <div class="glass-card" style="max-width: 600px;">
        <form method="POST" use:enhance>
            <div class="input-group">
                <label for="name" class="input-label">Player Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    class="input-field"
                    required
                    placeholder="e.g. MS Dhoni"
                />
            </div>

            <div class="input-group">
                <label for="role" class="input-label">Role</label>
                <select
                    id="role"
                    name="role"
                    class="input-field"
                    required
                    style="background-color: #1e293b;"
                >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
            </div>

            <div class="input-group">
                <label for="basePrice" class="input-label"
                    >Base Price (Lakhs)</label
                >
                <input
                    type="number"
                    id="basePrice"
                    name="basePrice"
                    class="input-field"
                    required
                    min="10"
                    placeholder="e.g. 50"
                />
            </div>

            <button type="submit" class="btn">Add Player</button>
        </form>
    </div>
</div>

<script>
    import { enhance } from "$app/forms";
    let { form } = $props();
</script>

<div class="login-container">
    <div class="glass-card login-card">
        <h1>Admin Login</h1>

        {#if form?.error}
            <div class="error-msg">{form.error}</div>
        {/if}

        <form method="POST" use:enhance>
            <div class="input-group">
                <label for="email" class="input-label">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    class="input-field"
                    required
                    placeholder="admin@example.com"
                    value={form?.email ?? "admin@example.com"}
                />
            </div>

            <div class="input-group">
                <label for="password" class="input-label">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    class="input-field"
                    required
                    placeholder="password"
                    value="password"
                />
            </div>

            <button type="submit" class="btn" style="width: 100%">Login</button>
        </form>
        <p
            style="margin-top: 1rem; text-align: center; font-size: 0.9rem; opacity: 0.7;"
        >
            (Use: admin@example.com / password)
        </p>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
    }
    .login-card {
        width: 100%;
        max-width: 400px;
    }
    .error-msg {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #fca5a5;
        padding: 0.75rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
    }
</style>

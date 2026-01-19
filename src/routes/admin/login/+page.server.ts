import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        const admin = db.admins.find(a => a.email === email && a.password === password);

        if (!admin) {
            return fail(400, { email, error: 'Invalid credentials' });
        }

        cookies.set('admin_session', 'true', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: false, // set to true in production
            maxAge: 60 * 60 * 24 // 1 day
        });

        throw redirect(303, '/admin/dashboard');
    }
};

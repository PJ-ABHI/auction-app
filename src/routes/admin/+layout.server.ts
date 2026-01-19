import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies, url }) => {
    if (url.pathname === '/admin/login') return;

    const session = cookies.get('admin_session');
    if (!session) {
        throw redirect(303, '/admin/login');
    }
};

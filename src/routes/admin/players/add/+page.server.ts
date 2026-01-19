import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        const role = formData.get('role');
        const basePrice = Number(formData.get('basePrice'));

        const newId = db.players.length > 0 ? Math.max(...db.players.map(p => p.id)) + 1 : 1;

        db.players.push({
            id: newId,
            name,
            role,
            basePrice,
            status: 'Unsold',
            team: null,
            soldPrice: 0
        });

        throw redirect(303, '/admin/dashboard');
    }
};

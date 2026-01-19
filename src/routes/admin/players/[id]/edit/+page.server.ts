import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const player = db.players.find(p => p.id === Number(params.id));
    if (!player) throw error(404, 'Player not found');
    return { player };
};

export const actions = {
    default: async ({ request, params }) => {
        const formData = await request.formData();
        const name = formData.get('name');
        const role = formData.get('role');
        const basePrice = Number(formData.get('basePrice'));
        const status = formData.get('status');

        const index = db.players.findIndex(p => p.id === Number(params.id));
        if (index !== -1) {
            db.players[index] = {
                ...db.players[index],
                name,
                role,
                basePrice,
                status
            };
        }

        throw redirect(303, '/admin/dashboard');
    }
};

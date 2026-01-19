import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    // Enrich the active auction data with player details if active
    let activePlayer = null;
    if (db.activeAuction.playerId) {
        activePlayer = db.players.find(p => p.id === db.activeAuction.playerId);
    }

    return {
        players: db.players,
        auction: {
            ...db.activeAuction,
            player: activePlayer,
            remainingTime: db.activeAuction.endTime ? Math.max(0, Math.ceil((db.activeAuction.endTime - Date.now()) / 1000)) : 0
        }
    };
};

export const actions = {
    startAuction: async ({ request }) => {
        const data = await request.formData();
        const playerId = Number(data.get('playerId'));
        const player = db.players.find(p => p.id === playerId);

        if (!player || player.status === 'Sold') {
            return fail(400, { error: 'Invalid player for auction' });
        }

        const DURATION_SECONDS = 30;

        db.activeAuction = {
            status: 'ACTIVE',
            playerId,
            startTime: Date.now(),
            endTime: Date.now() + (DURATION_SECONDS * 1000),
            currentBid: player.basePrice,
            highestBidder: null,
            history: []
        };

        return { success: true };
    },

    placeBid: async ({ request }) => {
        const data = await request.formData();
        const bidderName = data.get('bidderName');
        const amount = Number(data.get('amount'));

        if (db.activeAuction.status !== 'ACTIVE') {
            return fail(400, { error: 'Auction is not active' });
        }

        if (Date.now() > db.activeAuction.endTime) {
            return fail(400, { error: 'Auction has ended' });
        }

        if (amount <= db.activeAuction.currentBid) {
            return fail(400, { error: `Bid must be higher than current bid (₹ ${db.activeAuction.currentBid})` });
        }

        // Update Auction State
        db.activeAuction.currentBid = amount;
        db.activeAuction.highestBidder = bidderName;
        db.activeAuction.history.push({ name: bidderName, amount, time: new Date().toISOString() });

        // Extend time by 10 seconds if bid is placed in last 5 seconds (Anti-sniping, optional)
        if (db.activeAuction.endTime - Date.now() < 5000) {
            db.activeAuction.endTime += 10000;
        }

        return { success: true };
    },

    endAuction: async ({ request }) => {
        if (db.activeAuction.status !== 'ACTIVE') return;

        // Finalize
        const playerIndex = db.players.findIndex(p => p.id === db.activeAuction.playerId);
        if (playerIndex !== -1) {
            const auction = db.activeAuction;
            if (auction.highestBidder) {
                db.players[playerIndex].status = 'Sold';
                db.players[playerIndex].soldPrice = auction.currentBid;
                db.players[playerIndex].team = auction.highestBidder;
            } else {
                db.players[playerIndex].status = 'Unsold';
            }
        }

        db.activeAuction = {
            status: 'IDLE',
            playerId: null,
            startTime: null,
            endTime: null,
            currentBid: 0,
            highestBidder: null,
            history: []
        };

        return { success: true };
    }
};

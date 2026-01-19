export const db = {
    players: [
        { id: 1, name: "Virat Kohli", basePrice: 200, role: "Batsman", status: "Unsold", team: null, soldPrice: 0 },
        { id: 2, name: "Jasprit Bumrah", basePrice: 150, role: "Bowler", status: "Unsold", team: null, soldPrice: 0 },
        { id: 3, name: "Ben Stokes", basePrice: 180, role: "All-Rounder", status: "Unsold", team: null, soldPrice: 0 },
        { id: 4, name: "Rohit Sharma", basePrice: 190, role: "Batsman", status: "Unsold", team: null, soldPrice: 0 },
        { id: 5, name: "Rashid Khan", basePrice: 160, role: "Bowler", status: "Unsold", team: null, soldPrice: 0 }
    ],
    admins: [
        { email: "admin@example.com", password: "password" }
    ],
    // In-memory active auction state
    activeAuction: {
        status: 'IDLE', // IDLE, ACTIVE, ENDED
        playerId: null,
        startTime: null,
        endTime: null,
        currentBid: 0,
        highestBidder: null,
        history: []
    }
};

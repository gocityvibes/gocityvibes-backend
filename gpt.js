const axios = require('axios');

async function handleMessage(message, city, state, country) {
    if (message.toLowerCase().includes('weather')) {
        return {
            reply: `Weather info currently not supported until API key is connected.`,
        };
    }

    if (message.toLowerCase().includes('flight') || message.toLowerCase().includes('tickets to')) {
        return {
            reply: `Flights to Vegas, baby!\n\n1. ✈️ Southwest Airlines — $150 RT\n2. ✈️ United Airlines — $175 RT`,
            links: [
                { label: "Southwest", url: "https://www.southwest.com" },
                { label: "United", url: "https://www.united.com" }
            ]
        };
    }

    if (message.toLowerCase().includes('hotel')) {
        return {
            reply: `Try The Post Oak Hotel in Houston!`,
            hotel: {
                name: "The Post Oak Hotel",
                phone: "(844) 386-1600",
                website: "https://thepostoak.com"
            }
        };
    }

    return {
        reply: `Hi! You asked about "\${message}". I'm fetching real-time info soon.`,
    };
}

module.exports = { handleMessage };
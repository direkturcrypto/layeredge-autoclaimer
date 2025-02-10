const axios = require('axios');
const ethers = require('ethers');
const moment = require('moment');
const accounts = require('./private-key.json')

const BASE_URL = 'https://referralapi.layeredge.io/api';
const HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-GB,en;q=0.8',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'origin': 'https://dashboard.layeredge.io',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://dashboard.layeredge.io/',
    'sec-ch-ua': '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};

async function checkWallet(walletAddress) {
    try {
        const response = await axios.get(`${BASE_URL}/referral/wallet-details/${walletAddress}`, { headers: HEADERS }).catch((e) => ({status: e.status, message: e.message, data: null}));
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null; // Wallet not found
        }
        throw error;
    }
}

async function validateInviteCode(inviteCode) {
    try {
        const response = await axios.post(`${BASE_URL}/referral/verify-referral-code`, { invite_code: inviteCode }, { headers: HEADERS });
        return response.data.data.valid;
    } catch (error) {
        return false;
    }
}

async function registerWallet(walletAddress, inviteCode) {
    if (!await validateInviteCode(inviteCode)) {
        console.log(`🚨 Invite code ${inviteCode} is invalid.`);
        return;
    }
    
    try {
        const response = await axios.post(`${BASE_URL}/referral/register-wallet/${inviteCode}`, { walletAddress }, { headers: HEADERS });
        console.log(`✅ Wallet ${walletAddress} registered successfully.`);
        return response.data;
    } catch (error) {
        console.error(`Failed to register wallet: ${walletAddress}`, error.response?.data || error.message);
    }
}

async function claimPoints(walletAddress, privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    const timestamp = Date.now();
    const message = `I am claiming my daily node point for ${walletAddress} at ${timestamp}`;
    const sign = await wallet.signMessage(message);
    
    try {
        const response = await axios.post(`${BASE_URL}/light-node/claim-node-points`, { walletAddress, timestamp, sign }, { headers: HEADERS });
        console.log(`✅ Points claimed for ${walletAddress}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to claim points for ${walletAddress}`, error.response?.data || error.message);
    }
}

async function startNode(walletAddress, privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    const timestamp = Date.now();
    const message = `Node activation request for ${walletAddress} at ${timestamp}`;
    const sign = await wallet.signMessage(message);
    
    try {
        const response = await axios.post(`${BASE_URL}/light-node/node-action/${walletAddress}/start`, { timestamp, sign }, { headers: HEADERS });
        console.log(`✅ Node started for ${walletAddress}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to start node for ${walletAddress}`, error.response?.data || error.message);
    }
}

async function processWallet(walletAddress, privateKey, inviteCode) {
    let walletData = await checkWallet(walletAddress);

    if (!walletData) {
        console.log(`Wallet ${walletAddress} not registered, registering now...`);
        await registerWallet(walletAddress, inviteCode);
        // re-check user info
        walletData = await checkWallet(walletAddress)
    }

    if (!walletData) {
        return console.log(`🚨 failed execution ${walletAddress}`)
    }
    const userInfo = walletData.data
    let lastClaimed = moment().subtract('1', 'year').toDate()
    if (!userInfo.lastClaimed) {
        console.log(`✨ Wallet ${walletAddress} not yet registered`)
    } else {
        lastClaimed = userInfo.lastClaimed
    }

    console.log(`Wallet Address: ${userInfo.walletAddress}`)
    console.log(`Node Points: ${userInfo.nodePoints}`)
    console.log(`Last Claim Point: ${moment(lastClaimed).format('DD/MM/YYYY HH:mm:ss')}`)

    const diffDate = moment(lastClaimed).add(1, 'day').diff(moment().toDate())
    if (diffDate < 0) {
        await claimPoints(walletAddress, privateKey);
        await startNode(walletAddress, privateKey);
    }
}

console.log(`Load ${accounts.length} wallets`)
const reffCodes = [
    'i68XtFCI',
    '2LZwOF96',
    '40lNaUjr',
    'fKrTVUOY',
    'EenxNKTl',
    'bGcrJxh5',
    'fHz2dkAm',
    'zjpZQmLR',
    'AJ66jcov',
    'ajVTZCKo',
    'ak0lWvMa',
    'ZBTITWDw',
    'Znv8K0hs',
    '0oIR0GQs',
    'iE9qPwRS',
    '8VJlK7y1',
    'hrma8STB',
    'CEEfH46n',
    'y0U1BbyK',
    'uNr0tucw'
]
const main = async () => {
    for (let i=0; i<accounts.length; i++) {
        const jumlah = Math.floor(Math.random() * reffCodes.length);
        const reffCode = reffCodes[jumlah];

        console.log(`[${i+1}] ${accounts[i].address}`)
        await processWallet(accounts[i].address, accounts[i].privateKey, reffCode)
    }
}

main()

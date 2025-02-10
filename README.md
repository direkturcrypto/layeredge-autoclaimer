# LayerEdge AutoClaimer

## Requirements
- Install **Node.js v20.15.0** or higher
- Compatible with **Linux VPS** and **Windows**

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/direkturcrypto/layeredge-autoclaimer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd layeredge-autoclaimer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Edit the `private-key.json` file and add your wallets in the following format:
   ```json
   [
     {"address": "xxxx", "privateKey": "xxxxx"}
   ]
   ```
   - You can add more than two wallets.

5. Edit the `index.js` file and update the `refCodes` variable:
   - Add multiple referral codes to register new wallets if they haven’t been registered before.
   - The more referral codes, the better.

Enjoy! 🚀

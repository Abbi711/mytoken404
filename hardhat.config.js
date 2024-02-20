require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    "sepolia": {
      "url": `https://sepolia.infura.io/v3/${process.env.SEPOLIA_INFURA_KEY}`,
      "accounts": [
        process.env.ACCOUNT_ONE_PK,
        process.env.ACCOUNT_TWO_PK
      ]
    }
  }
};

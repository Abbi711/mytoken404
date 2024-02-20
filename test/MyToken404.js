const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const tokenName = "NewToken"
    const tokenSymbol = "NT"
    const tokenDecimals = 7
    const tokenSupply = 10000
    const tokenOwner = owner;
    const tokenPrice = 10;
    

    const Token = await ethers.getContractFactory("MyToken404");
    const token = await Token.deploy(tokenName, tokenSymbol, tokenDecimals, tokenSupply, tokenOwner, tokenPrice);
    await token.setWhitelist(owner, true);
    return { token, owner, otherAccount, tokenName, tokenSymbol, tokenDecimals, tokenSupply, tokenOwner, tokenPrice };
  }

  describe("Deployment", function () {
    it("Should set the right name for the token", async function () {
      const { token, tokenName } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal(tokenName);
    });

    it("Should set the right price for the token", async function () {
      const { token, tokenPrice } = await loadFixture(deployTokenFixture);
      expect(await token.tokenPrice()).to.equal(tokenPrice);
    });

    // similar tests for other token params
  });


  describe("Buy tokens", function(){
    describe("validations", function(){
      it("should revert when the token balance is insufficient", async function(){
        const { token, tokenSupply, tokenDecimals } = await loadFixture(deployTokenFixture);
        const amount = tokenSupply * 10**tokenDecimals + 100;
        await expect(token.buy(amount)).to.be.revertedWith("Insufficient Tokens")
      })

      it("should revert when the no ETH is supplied to buy specified amount of tokens", async function(){
        const { token, tokenDecimals } = await loadFixture(deployTokenFixture);
        const amount = 10 * 10**tokenDecimals;
        await expect(token.buy(amount)).to.be.revertedWith("Insufficient ETH for the trade")
      })

      it("should revert when the insufficient ETH is supplied to buy specified amount of tokens", async function(){
        const { token, tokenDecimals } = await loadFixture(deployTokenFixture);
        const options = { value : "1" };
        const amount = 100 * 10**tokenDecimals;
        await expect(token.buy(amount, options)).to.be.revertedWith("Insufficient ETH for the trade")
      })
    });



    describe("events", function(){
      it("TokenPurchased event should be emitted on purchasing the tokens from account1", async function(){
        const { token, tokenDecimals, owner, tokenPrice } = await loadFixture(deployTokenFixture);
        const amount = 100 * 10**tokenDecimals;
        const options = { value : amount * tokenPrice };
      
        await expect(token.buy(amount, options))
            .to.emit(token, "TokenPurchased").withArgs(owner, amount, tokenPrice)
      })

      it("TokenPurchased event should be emitted on purchasing the tokens from account2", async function(){
        const { token, tokenDecimals, otherAccount, tokenPrice } = await loadFixture(deployTokenFixture);
        const amount = 100 * 10**tokenDecimals;
        const options = { value : amount * tokenPrice };
      
        await expect(token.connect(otherAccount).buy(amount, options))
            .to.emit(token, "TokenPurchased").withArgs(otherAccount, amount, tokenPrice)
      })

      it("BalanceReturned event should be emitted on purchasing the tokens by sending more ETH", async function(){
        const { token, tokenDecimals, otherAccount, tokenPrice } = await loadFixture(deployTokenFixture);
        const amount = 100 * 10**tokenDecimals;
        const options = { value : (amount * tokenPrice) + 1 };
      
        await expect(token.connect(otherAccount).buy(amount, options))
            .to.emit(token, "BalanceReturned").withArgs(otherAccount, 1)
      })
    })

  })

  describe("Set Token price", function(){
    it("owner should be able to new set token price", async function(){
      const { token, tokenDecimals, otherAccount, tokenPrice } = await loadFixture(deployTokenFixture);
      await token.setTokenPrice(20);
      expect(await token.tokenPrice()).to.equal(20);
    });

    it("other accounts should not be able to change token price", async function(){
      const { token, tokenDecimals, otherAccount, tokenPrice } = await loadFixture(deployTokenFixture);
      await expect(token.connect(otherAccount).setTokenPrice(20)).to.be.revertedWithCustomError(token, "Unauthorized()");
    });
  });

});

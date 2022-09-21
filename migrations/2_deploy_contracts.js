const DEEP19IT054 = artifacts.require("./DEEP19IT054.sol");
const TokenSale = artifacts.require("./TokenSale.sol");
const tokenPrice = 1000000000000000;

module.exports = function (deployer) {
  deployer.deploy(DEEP19IT054,1000000).then(()=>{
    return deployer.deploy(TokenSale,DEEP19IT054.address,tokenPrice);
  });
};
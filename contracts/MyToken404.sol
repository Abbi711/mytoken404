//SPDX-License_identifier:MIT

pragma solidity >=0.8.18;
import "./ERC404.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MyToken404 is Ownable, ERC404, ReentrancyGuard {

    uint256 public tokenPrice; 

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalNativeSupply,
        address _owner,
        uint256 _tokenPrice
    ) ERC404(_name, _symbol, _decimals, _totalNativeSupply, _owner) {
        tokenPrice = _tokenPrice;
        balanceOf[owner] = _totalNativeSupply * 10 ** _decimals;
    }

    event TokenPurchased(address buyer, uint256 quantity, uint256 tokenPrice);
    event BalanceReturned(address buyer, uint256 amount);

    /*
    * Funtion to allow users to purchase MyToken404 tokens by transferring ETH 
    ** @params _quantity: amount of tokens required
    */
    function buy(uint256 _quantity) external payable nonReentrant {
        // ensure that owner has enough token balance for the trade
        require(_quantity <= balanceOf[owner], "Insufficient Tokens");

        // ensure that the buyer has supplied enough ETH for the trade
        require(msg.value >= _quantity * tokenPrice, "Insufficient ETH for the trade");

        _transfer(owner, msg.sender, _quantity);

        if(msg.value > _quantity * tokenPrice){
            payable(msg.sender).transfer(msg.value - (_quantity * tokenPrice));
            emit BalanceReturned(msg.sender, msg.value - (_quantity * tokenPrice));
        }

        emit TokenPurchased(msg.sender, _quantity, tokenPrice);
    }

    function setTokenPrice(uint256 _newPrice) onlyOwner public {
        tokenPrice = _newPrice;
    }


    /*
    * Funtion to override tokenURI function
    ** @params _id: the tokenID of the token
    */
    function tokenURI(uint256 _id) public view override  returns (string memory){
        return string.concat("http://ww38.dummyurl.com/?subid1=20240221-0030-02e9-8b5a-00b9d857c121", Strings.toString(_id));
    }

}
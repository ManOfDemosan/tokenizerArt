// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Jaehwkim42ArtOnChain is ERC721, ERC721Enumerable, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("42 OnChain Art by jaehwkim", "J42OC")
        Ownable(initialOwner)
    {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);

        string memory svg = _generateSVG(tokenId);
        string memory imageURI = string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        ));

        string memory json = string(abi.encodePacked(
            '{"name":"42 OnChain Art #', Strings.toString(tokenId),
            '","description":"A fully on-chain NFT artwork featuring the number 42, created by jaehwkim.",',
            '"image":"', imageURI, '",',
            '"attributes":[{"trait_type":"Artist","value":"jaehwkim"},{"trait_type":"School","value":"42"},{"trait_type":"Storage","value":"On-Chain"}]}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function _generateSVG(uint256 tokenId) internal pure returns (string memory) {
        uint256 hue = (tokenId * 137) % 360;

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">'
            '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">'
            '<stop offset="0%" style="stop-color:hsl(', Strings.toString(hue), ',70%,15%)"/>'
            '<stop offset="100%" style="stop-color:hsl(', Strings.toString((hue + 60) % 360), ',70%,25%)"/>'
            '</linearGradient></defs>'
            '<rect width="400" height="400" fill="url(#bg)"/>'
            '<text x="200" y="180" font-family="monospace" font-size="120" font-weight="bold" '
            'fill="white" text-anchor="middle" dominant-baseline="middle">42</text>'
            '<text x="200" y="280" font-family="monospace" font-size="24" '
            'fill="rgba(255,255,255,0.7)" text-anchor="middle">jaehwkim #', Strings.toString(tokenId), '</text>'
            '<rect x="20" y="20" width="360" height="360" rx="20" fill="none" '
            'stroke="rgba(255,255,255,0.2)" stroke-width="2"/>'
            '</svg>'
        ));
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address payable owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        uint256 noOfVoters;
        bool completed;
        string name;
        string campaignType;
    }

    struct Voter {
        mapping(address=>bool) voters;
    }
    mapping(uint256 => Voter) voter;

    struct Contributor {
        mapping(address=>uint) contributor;
    }
    mapping(uint256 => Contributor) contributors;

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;

    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image, string memory _name, string memory _campaignType) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(campaign.deadline < block.timestamp, "The deadline should be a date in the future.");

        campaign.owner = payable(_owner);
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.noOfVoters = 0;
        campaign.completed = false;
        campaign.name = _name;
        campaign.campaignType = _campaignType;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
        require(amount > 0, "Please enter some amount");
        Campaign storage campaign = campaigns[_id];

        if(contributors[_id].contributor[msg.sender] == 0){
            campaign.donators.push(msg.sender);
            campaign.donations.push(amount);
        } else {
            for(uint i=0; i<campaign.donators.length; i++){
                uint256 newAmount = campaign.donations[i] + amount;
                campaign.donations[i] = newAmount;
            }
        }
               
        contributors[_id].contributor[msg.sender] += amount;
        campaign.amountCollected = campaign.amountCollected + amount;
    }

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

    function refund(uint256 _id) public payable {
        require(campaigns[_id].deadline < block.timestamp && campaigns[_id].amountCollected < campaigns[_id].target, "You are not eligible");
        require(contributors[_id].contributor[msg.sender]>0, "You must be a contributor");
        address payable user=payable(msg.sender);
        user.transfer(contributors[_id].contributor[msg.sender]);
        campaigns[_id].amountCollected -= contributors[_id].contributor[msg.sender];

        for (uint i = 0 ; i < campaigns[_id].donators.length; i++) {
            if (msg.sender == campaigns[_id].donators[i]) {
                for (uint j = i; j < campaigns[_id].donators.length - 1; j++) {
                    campaigns[_id].donators[i] = campaigns[_id].donators[i + 1];
                    campaigns[_id].donations[i] = campaigns[_id].donations[i + 1];
                }
                campaigns[_id].donators.pop();
                campaigns[_id].donations.pop();
                break ;
            }
        }
        contributors[_id].contributor[msg.sender]=0;  
    }

    function voteRequest(uint256 _requestNo) public{
        require(contributors[_requestNo].contributor[msg.sender]>0,"You must be a contributor");
        Campaign storage thisRequest=campaigns[_requestNo];
        require(thisRequest.completed==false,"This campaign has been successfully completed");
        require(voter[_requestNo].voters[msg.sender]==false,"You have already voted");
        voter[_requestNo].voters[msg.sender]=true;
        thisRequest.noOfVoters++;
    }

    function withdraw(uint256 _requestNo) public{
        Campaign storage thisRequest=campaigns[_requestNo];
        require(thisRequest.owner == msg.sender, "You are not the owner of this campaign");
        require(block.timestamp > thisRequest.deadline, "You cannot withdraw before deadline");
        require(thisRequest.completed==false,"The request has been completed");
        require(thisRequest.amountCollected>=thisRequest.target, "Can't withdraw, campaign is not successful yet");
        require(thisRequest.noOfVoters > thisRequest.donators.length/2,"Majority does not support");
        pickWinner(_requestNo);
        thisRequest.owner.transfer(thisRequest.amountCollected - (thisRequest.amountCollected)/10);
        thisRequest.completed=true;
    }

    function pickWinner(uint256 _id) internal {
        Campaign storage thisRequest=campaigns[_id];
        uint r = uint(keccak256(abi.encodePacked(block.gaslimit, block.timestamp, thisRequest.donators.length)));
        uint index = r % thisRequest.donators.length;
        address payable winner = payable (thisRequest.donators[index]);
        winner.transfer((thisRequest.amountCollected)/10);
    }
}
import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite, useDisconnect } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';
import { daysLeft } from '../utils';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // const { contract } = useContract('0x775420aa1b025CeAbB878B3E4711d62B624Af51b');
  const { contract } = useContract('0xA0CD4387eb0bF1d92109eE6c4d42eDa574E16ec3');
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();
  const disconnectWallet = useDisconnect();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign(
        {args:[
        address, // owner
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime(), // deadline,
        form.image,
        form.name,
        form.campaignType
      ]})

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      name: campaign.name,
      campaignType: campaign.campaignType,
      noOfVoters: campaign.noOfVoters.toNumber(),
      completed: campaign.completed,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);  //&& daysLeft(campaign.deadline) > 0

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    try {
      const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});
      return data;      
    } catch (error) {
      alert(error.message);
    }
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }

  const refund = async (pId) => {
    try{
      const data = await contract.call('refund', [pId]);
      return data;
    } catch(error){
      alert(error.message);
    }
  }

  const voteRequest = async (pId) => {
    try {
      const data = await contract.call('voteRequest', [pId]);
      return data;     
    } catch (error) {
      alert(error.message);
    }
  }

  const withdraw = async (pId) => {
    try {
      const data = await contract.call('withdraw', [pId]);
      return data;     
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        refund,
        voteRequest,
        withdraw,
        disconnectWallet
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);

import { Contract, providers, utils, BigNumber } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "../constants";

export const removeLiquidity = async (signer, _LPtokens) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer);
        const tx = await exchangeContract.removeLiquidity(_LPtokens);
        await tx.wait();
    } catch(err) {
        console.error(err);
    }
}

export const getTokensAfterRemove = async (provider, _LPtokens, ethReserve, CDTokenReserve) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
        const LPtokenReserve = await exchangeContract.totalSupply();

        const _removeCDToken = (CDTokenReserve * _LPtokens) / LPtokenReserve;
        const _removeEth = (ethReserve * _LPtokens) / LPtokenReserve;

        return(_removeEth, _removeCDToken);
    } catch (err) {
        console.error(err);
    }
}
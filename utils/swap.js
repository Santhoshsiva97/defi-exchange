import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export const getTokensAmountAfterSwap = async (provider, amountOfSwapWei, ethSelected, ethReserve, CDTokenReserve) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);

        if(ethSelected) {
            const getAmount = await exchangeContract.getAmountOfTokens(amountOfSwapWei, ethReserve, CDTokenReserve);
            return getAmount;
        } else {
            const getAmount = await exchangeContract.getAmountOfTokens(amountOfSwapWei, CDTokenReserve, ethReserve);
            return getAmount;
        }
    } catch(err) {
        console.error(err);
    }
}

export const swap = async (signer, swapAmountWei, tokensToBeAfterSwap, ethSelected) => {
    try {
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer);
        let tx;

        if (ethSelected) {
            tx = await exchangeContract.ethToCryptoDevToken(tokensToBeAfterSwap, {
                value: swapAmountWei
            });
        } else {
            tx = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS, swapAmountWei.toString());
            await tx.wait();

            tx = await exchangeContract.cryptoDevToEth(swapAmountWei, tokensToBeAfterSwap);
            await tx.wait();
        }
    } catch(err) {
        console.error(err);
    }
}
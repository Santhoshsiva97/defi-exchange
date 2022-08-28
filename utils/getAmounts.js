import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";


export const getEthBalance = async (provider, address, contract = false) => {
    try {
        if(contract) {
            const getBalance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return getBalance;
        } else {
            const getBalance = await provider.getBalance(address);
            return getBalance;
        }
    } catch(err) {
        console.error(err);
        return 0;
    }
}

export const getCDTokenBalance = async (provider, address) => {
    try {
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);
        const cdBalance = await tokenContract.balanceOf(address);
        return cdBalance;
    } catch(err) {
        console.error(err);
        return 0;
    }
}

export const getLPTokenBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
        const lpBalance = await exchangeContract.balanceOf(address);
        return lpBalance;
    } catch(err) {
        console.error(err);
        return 0;
    }
}

export const getCDTokenReserve = async (provider) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider);
        const getBalance = await exchangeContract.getReserve();
        return getBalance;
    } catch(err) {
        console.error(err);
        return 0;
    }
}
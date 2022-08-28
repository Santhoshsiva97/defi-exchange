import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export const addLiquidity = async (signer, addEthAmountWei, addCDTokenWei) => {
    try {
        const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer);

        let tx = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS, addCDTokenWei.toString());
        await tx.wait();

        tx = await exchangeContract.addLiquidity(addCDTokenWei, {
            value: addEthAmountWei,
            // gasLimit: utils.parseEther("0.0000000000001"),
        });
        await tx.wait();

    } catch(err) {
        console.error(err);
    }
}

export const calcualteCD = async (_addEther=0, ethBalanceReserve, CDTokenReserve) => {
    try {
        const addEtherAmountWei = utils.parseEther(_addEther);
        // (Given CD / CD reserve) / (Given eth / eth reserve)
        const CDTokenAmount = (CDTokenReserve * addEtherAmountWei) / ethBalanceReserve;
        return CDTokenAmount;
    } catch(err) {
        console.error(err);
    }
}
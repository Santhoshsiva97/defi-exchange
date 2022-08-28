import { BigNumber, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { addLiquidity, calcualteCD } from "../utils/addLiquidity";
import { removeLiquidity, getTokensAfterRemove } from "../utils/removeLiquidity";
import { getCDTokenBalance, getCDTokenReserve, getEthBalance, getLPTokenBalance } from "../utils/getAmounts";
import { getTokensAmountAfterSwap, swap } from "../utils/swap";

export default function Home() {

  const [ loading, setLoading ] = useState(false);
  const [ liquidityTab, setLiquidityTab ] = useState(true);
  const zero = BigNumber.from(0);

  const [ ethBalance, setEthbalance ] = useState(zero);
  const [ CDReserve, setCDReserve ] = useState(zero);
  const [ lpReserve, setLpReserve ] = useState(zero);
  const [ CDBalance, setCDBalance ] = useState(zero);
  const [ lpBalance, setLpBalance ] = useState(zero);
  const [ ethReserveContract, setEthReserveContract ] = useState(zero);
  const [ addEther, setAddEther ] = useState(zero);
  const [ removeEther, setRemoveEther ] = useState(zero);
  const [ addCD, setAddCD ] = useState(zero);
  const [ removeCD, setRemoveCD ] = useState(zero);
  const [ removeLP, setRemoveLP ] = useState("0");
  const [ swapAmount, setSwapAmount ] = useState("");
  const [ tokensReceivedAfterSwap, setTokensReceivedAfterSwap ] = useState(zero);
  const [ ethSelected, setEthSelected ] = useState(true);
  const web3modalRef = useRef();
  const [ walletConnected, setWalletConnected ] = useState(false);

  const getAmounts = async() => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const ethBalance = await getEthBalance(provider, address);
      const CDReserve = await getCDTokenReserve(provider);
      const LPReserve = await getLPTokenBalance(provider, address);
      const CDTokenBalance = await getCDTokenBalance(provider, address);
      const ethContractBalancce = await getEthBalance(provider, null, true);

      setEthbalance(ethBalance);
      setCDReserve(CDReserve);
      setLpReserve(LPReserve);
      setCDBalance(CDTokenBalance);
      setEthReserveContract(ethContractBalancce);

    } catch(err) {
      console.error(err);
    }
  }

  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);
      if(!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swap(signer, swapAmountWei, tokensReceivedAfterSwap, ethSelected);
        setLoading(false);
        await getAmounts();
        setSwapAmount("");
      }
    } catch(err) {
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  }

  const _getAmountReceivedAfterSwap = async (_swapToken) => {
    try {
      const swapAmountWei = utils.parseEther(_swapToken.toString());
      if(!swapAmountWei.eq(zero)) {
        const provider = await getProviderOrSigner(false);
        const _ethBalance = await getEthBalance(provider, null, true);
        const getAmount = await getTokensAmountAfterSwap(provider, swapAmountWei, ethSelected, _ethBalance, CDReserve);
        setTokensReceivedAfterSwap(getAmount);
      } else {
        setTokensReceivedAfterSwap(zero);
      }
    } catch(err) {
      console.error(err);
    }
  }

  const _addLiquidity = async () => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());
      if(!addEtherWei.eq(zero) && !addCD.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addEtherWei, addCD);
        setLoading(false);
        setAddCD(zero);
        await getAmounts();
      } else {
        setAddCD(zero);
      }
    } catch(err) {
      console.error(err);
      setLoading(false);
      setAddCD(zero);
    }
  }

  const _removeLiquidity = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const LPTokenWei = utils.parseEther(removeLP);
      setLoading(true);
      await removeLiquidity(signer, LPTokenWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);
    } catch(err) {
      console.error(err);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  }

  const _getTokensAfterRemove = async(_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner(false);
      const removeLPWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEthBalance(provider, null, true);
      const _CDReserve = await getCDTokenReserve(provider);
      const { _removeEth, _removeCDToken } = await getTokensAfterRemove(provider, removeLPWei, _ethBalance, _CDReserve);
      setRemoveCD(_removeCDToken);
      setRemoveEther(_removeEth);
    } catch(err) {
      console.error(err);
    }
  }

  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch(err) {
      console.error(err);
    }
  }

  const getProviderOrSigner = async(needSigner = false) => {
    try {
      const provider = await web3modalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Change the network to Rinkeby");
        throw new Error("Change network to Rinkeby");
      }
      if(needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch(err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if(!walletConnected) {
      web3modalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts();
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {utils.formatEther(CDBalance)} Crypto Dev Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} Crypto Dev LP tokens
          </div>
          <div>
            {/* If reserved CD is zero, render the state for liquidity zero where we ask the user
            how much initial liquidity he wants to add else just render the state where liquidity is not zero and
            we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
            {utils.parseEther(CDReserve.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Amount of CryptoDev tokens"
                  onChange={(e) =>
                    setAddCD(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    )
                  }
                  className={styles.input}
                />
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    // calculate the number of CD tokens that
                    // can be added given  `e.target.value` amount of Eth
                    const _addCDTokens = await calcualteCD(
                      e.target.value || "0",
                      ethReserveContract,
                      CDReserve
                    );
                    setAddCDTokens(_addCDTokens);
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                  {`You will need ${utils.formatEther(addCD)} Crypto Dev
                  Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            )}
            <div>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLP(e.target.value || "0");
                  // Calculate the amount of Ether and CD tokens that the user would receive
                  // After he removes `e.target.value` amount of `LP` tokens
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                {`You will get ${utils.formatEther(removeCD)} Crypto
              Dev Tokens and ${utils.formatEther(removeEther)} Eth`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              // Calculate the amount of tokens user would receive after the swap
              await _getAmountReceivedAfterSwap(e.target.value || "0");
            }}
            className={styles.input}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              // Initialize the values back to zero
              await _getAmountReceivedAfterSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {ethSelected
              ? `You will get ${utils.formatEther(
                  tokensReceivedAfterSwap
                )} Crypto Dev Tokens`
              : `You will get ${utils.formatEther(
                  tokensReceivedAfterSwap
                )} Eth`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Crypto Dev Tokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(true);
              }}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodev.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );

}

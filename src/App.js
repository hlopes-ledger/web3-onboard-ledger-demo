import Onboard from "@web3-onboard/core";

import { useState } from "react";
import { VStack, Button, Text, HStack } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import injectedModule from "@web3-onboard/injected-wallets";
import ledgerModule from '@web3-onboard/ledger'

const MAINNET_RPC_URL = `https://cloudflare-eth.com`;

export const shortenAddress = (address) => {
  if (!address) return "No Account";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{2})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

const ledger = ledgerModule();
const injected = injectedModule();

const onboard = Onboard({
  wallets: [injected, ledger],
  chains: [
    {
      id: "0x1", // chain ID must be in hexadecimel
      token: "ETH", // main chain token
      namespace: "evm",
      label: "Ethereum Mainnet",
      rpcUrl: MAINNET_RPC_URL
    }
  ]
});

export default function Home() {
  const [_, setProvider] = useState();
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const wallets = await onboard.connectWallet();
      console.log("wallets are", wallets);

      if (wallets.length) {
        setIsLoading(true);
        const { accounts, chains, provider } = wallets[0];
        if (accounts.length) {
          console.log("accounts are", accounts);
          setAccount(accounts[0].address);
        }
        setChainId(chains[0].id);
        setProvider(provider);
        setIsLoading(false);
      }
    } catch (error) {
      setError(error);
    }
  };

  const disconnect = async () => {
    const [primaryWallet] = await onboard.state.get().wallets;
    if (!primaryWallet) return;
    await onboard.disconnectWallet({ label: primaryWallet.label });
    refreshState();
  };

  const refreshState = () => {
    setAccount("");
    setChainId("");
    setProvider();
  };

  return (
    <>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="400"
          >
            Connect with Web3-Onboard
          </Text>
        </HStack>
        {isLoading && <div>Loading...</div>}
        <HStack>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {account ? (
              <Text color="green">Connected</Text>
            ) : (
              <Text color="#cd5700">Not connected</Text>
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${shortenAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
        </VStack>
      </VStack>
    </>
  );
}

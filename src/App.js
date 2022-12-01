import { useEffect, useState } from "react";
import { VStack, Button, Text, HStack } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import injectedModule from "@web3-onboard/injected-wallets";
import ledgerModule from '@web3-onboard/ledger';
import walletConnectModule from '@web3-onboard/walletconnect';

import Onboard from "@web3-onboard/core";

export const shortenAddress = (address) => {
  if (!address) return "No Account";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{2})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

const ledger = ledgerModule({
  chainId: 1,
  rpc: {
    1: `https://cloudflare-eth.com/`, // Mainnet
    5: 'https://goerli.optimism.io',  // Goerli
    137: "https://polygon-rpc.com/",  // Polygon
  }
});
const injected = injectedModule();
const walletConnect = walletConnectModule();

const wallets = [injected, ledger, walletConnect];
const chains = [
  {
    id: "0x1", // chain ID must be in hexadecimal
    token: "ETH", // main chain token
    namespace: "evm",
    label: "Ethereum Mainnet",
    rpcUrl: 'https://cloudflare-eth.com',
  },
  {
    id: "0x5", // chain ID must be in hexadecimal
    token: "ETH", // main chain token
    namespace: "evm",
    label: "Ethereum Goerli",
    rpcUrl: "https://goerli.optimism.io",
  },
  {
    id: "0x89",
    token: "MATIC",
    namespace: "evm",
    label: "Polygon",
    rpcUrl: "https://polygon-rpc.com/"
  }
];

const onboard = Onboard({
  wallets,
  chains,
  appMetadata: {
    name: "Ledger web3-Onboard Demo",
    icon: '<svg>My App Icon</svg>',
    description: "A demo of Web3-Onboard with Ledger."
  },
  // accountCenter: {
  //   desktop: {
  //     position: 'topRight',
  //     enabled: true,
  //     minimal: false
  //   },
  //   // mobile: {
  //   //   position: 'bottomRight',
  //   //   enabled: true,
  //   //   minimal: true
  //   // }
  // }
});

export const toHex = (val) =>
  typeof val === 'number' ? `0x${val.toString(16)}` : val;

export default function Home() {
  const [provider, setProvider] = useState();
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [isConnecting, setIsConnecting] = useState(false);

  const currentState = onboard.state.get()

  const connectWallet = async () => {
    console.log('>> connectWallet');
    setIsConnecting(true);

    const wallets = await onboard.connectWallet();
    console.log(">> wallets are", wallets);

    if (wallets.length) {
      const { accounts, chains, provider } = wallets[0];

      if (accounts.length) {
        console.log(">> accounts are", accounts);
        setAccount(accounts[0].address);
      }
      setChainId(chains[0].id);
      setProvider(provider);
    };
    setIsConnecting(false);
  }

  // called by handleDisconnect and when disconnecting from wallet
  const disconnect = async () => {
    console.log('>> dicconnect');

    const [primaryWallet] = onboard.state.get().wallets;
    if (!primaryWallet) return;

    console.log('>> disconnecting primaryWallet', primaryWallet);
    await onboard.disconnectWallet({ label: primaryWallet.label });

    setAccount();
    setChainId();
    setProvider();
  };

  const switchAccount = (accounts) => {
    console.log('>> accountsChanged', accounts);
    setAccount(accounts[0]);
  }

  const switchChain = (chainId) => {
    console.log('>> chainChanged', chainId);
    setChainId(chainId);
  }

  useEffect(() => {
    console.log('>> useEffect');
    console.log('>> current state is', currentState);

    if (provider?.on) {
      console.log('>> assigning provider event handlers');

      provider.on("connect", () => console.log('>> connect event fired'));
      provider.on("close", (code, reason) => console.log('>> close event fired', code, reason));
      provider.on("networkChanged", (networkId) => console.log('>> networkChanged event fired', networkId));
      provider.on("eth_subscription", (result) => console.log('>> eth_subscription event fired', result));

      provider.on("disconnect", disconnect);
      provider.on("accountsChanged", switchAccount);
      provider.on("chainChanged", switchChain);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("disconnect", disconnect);
          provider.removeListener("accountsChanged", switchAccount);
          provider.removeListener("chainChanged", switchChain);
        }
      };
    }
  }, [provider]);

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
        <HStack>
          {!account ? (
            <Button onClick={connectWallet} disabled={isConnecting}>Connect Wallet</Button>
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

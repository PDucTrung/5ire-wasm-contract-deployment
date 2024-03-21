import { CodePromise, Abi, ContractPromise } from '@polkadot/api-contract';
import { ApiPromise, WsProvider, Keyring} from '@polkadot/api';
import { createDb } from "./helpers.js";
import * as dotenv from 'dotenv';
dotenv.config();

// import .contract file as json string
import { abi } from "./contracts/bridge_token.js";

const PHRASE = process.env.PHRASE;
const PROVIDER = process.env.PROVIDER;

try {
  let address; // variable for storing the address of the deployed contract 

  // API creation for connection to the chain
  const wsProvider = new WsProvider(PROVIDER);
  const api = await ApiPromise.create({ provider: wsProvider });

  
  // convert json into usable contract ABI 
  let contractAbi = new Abi(abi, api?.registry?.getChainProperties());

  // instantiating wasm blob on the blockchain
  const code = new CodePromise(api, abi, abi.source.wasm);
  
  // gas limit for deployment
  const gasLimit = 100000n * 1000000n

  // endowment
  const value = 0;
  
  
  // adding fire account for paying the gas fee
  const keyring = new Keyring({ type: "ed25519" });
  const userKeyring = keyring.addFromMnemonic(PHRASE);
  // parameters for constructor function inside the contract

  // Constructor New
  let constructorIndex = 0;

  try {
    // initialize
    let trading_rate = 300; // u32;
    let token_azero_contract_address = '5Gc8511m86vuzUECu5SEHnZmyrQLgg5BTT4FVea5fcE7VKEh';  // AccountId,
    let token_5ire_contract_address = '5FNhUSS5qvxDnQm61qtmufoozyhuc15ae5He791ydSi9sJcS'; // AccountId

    // methdod
    let newMethod = code && contractAbi?.constructors[constructorIndex]?.method
        ? 
        code.tx[contractAbi.constructors[constructorIndex].method](
            {
                gasLimit: gasLimit,
                storageDepositLimit: null,
                value: value
            },
            trading_rate,
            token_azero_contract_address,
            token_5ire_contract_address,
        )
    : null;

    // code deploy
    const unsub = await newMethod.signAndSend(userKeyring, async (response) => {
      if (response.status.isInBlock || response.status.isFinalized) {
        address = response.contract.address.toString();
        console.log("address ====== ", address);
        const contract = {
          bridge_token: {
            address: address,
            hash: abi.source.hash,
          },
        };
        createDb(contract);
        console.log("deploy success");
        unsub();
      }
    });

} catch (e) {
    console.log("error catch", e);
}
}
catch(err){
  console.log("error",err.toString())
}
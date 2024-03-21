import { CodePromise, Abi, ContractPromise } from "@polkadot/api-contract";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { BN, BN_ONE } from "@polkadot/util";
import * as dotenv from 'dotenv';
dotenv.config();
// import .contract file as json string
import { abi } from "./contracts/bridge_token.js";

const MAX_CALL_WEIGHT = new BN(500_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

const PHRASE = process.env.PHRASE;
const PROVIDER = process.env.PROVIDER;

try {
  // API creation for connection to the chain
  const wsProvider = new WsProvider(PROVIDER);
  const api = await ApiPromise.create({ provider: wsProvider });

  // gas limit for deployment
  //const gasLimit = 100000n * 1000000n
  const gasLimit = api.registry.createType("WeightV2", {
    refTime: MAX_CALL_WEIGHT,
    proofSize: PROOFSIZE,
  });

  // adding fire account for paying the gas fee
  const keyring = new Keyring({ type: "ed25519" });
  const userKeyring = keyring.addFromMnemonic(PHRASE);
  // parameters for constructor function inside the contract

  // Put your contract address that you already deployed
  const contract = new ContractPromise(
    api,
    abi,
    "5FGSf6L9cnmPVy2GYXA7pcXAL2hZ3g2iTu4vtxYJzuC1ui1R"
  );

  // create transaction
  let amount = "1000000000000000";
  let receiver = userKeyring.address.toString();
  const tx = contract.tx.createNewTransaction(
    {
      gasLimit: gasLimit,
      storageDepositLimit: null,
    },
    amount,
    receiver
  );

  const unsub = await tx.signAndSend(userKeyring, (result) => {
    if (result.status.isInBlock || result.status.isFinalized) {
      console.log("Block finalized");
      unsub();
    }
  });
} catch (err) {
  console.log("error", err.toString());
}

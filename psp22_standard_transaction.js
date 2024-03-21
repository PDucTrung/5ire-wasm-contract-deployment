import { CodePromise, Abi, ContractPromise } from "@polkadot/api-contract";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { BN, BN_ONE } from "@polkadot/util";
import * as dotenv from "dotenv";
dotenv.config();
// import .contract file as json string
import { abi } from "./contracts/psp22_standard.js";

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
    "5Gh3SptqQe6ocV1VDTmkZMsd1n5zWMi638kBW9n55W9rUFkY"
  );

  //   // create transaction
  //   let role = 4254773782;
  //   let account = userKeyring.address.toString();
  //   const tx_grant = contract.tx["accessControl::grantRole"](
  //     {
  //       gasLimit: gasLimit,
  //       storageDepositLimit: null,
  //     },
  //     role,
  //     account
  //   );

  //   const unsub_grant = await tx_grant.signAndSend(userKeyring, (result) => {
  //     if (result.status.isInBlock || result.status.isFinalized) {
  //       console.log("Block finalized 1");
  //       unsub_grant();
  //     }
  //   });

  //   // create transaction
  //   let mint_amount = "100000000000000000";
  //   let to = userKeyring.address.toString();
  //   const tx_mint = contract.tx["psp22::increaseAllowance"](
  //     {
  //       gasLimit: gasLimit,
  //       storageDepositLimit: null,
  //     },
  //     to,
  //     mint_amount
  //   );

  //   const unsub_mint = await tx_mint.signAndSend(userKeyring, (result) => {
  //     if (result.status.isInBlock || result.status.isFinalized) {
  //       console.log("Block finalized 2");
  //       unsub_mint();
  //     }
  //   });

  // create transaction
  let amount = "10000000000000000000";
  let spender = "5FGSf6L9cnmPVy2GYXA7pcXAL2hZ3g2iTu4vtxYJzuC1ui1R";
  const tx = contract.tx["psp22::increaseAllowance"](
    {
      gasLimit: gasLimit,
      storageDepositLimit: null,
    },
    spender,
    amount
  );

  const unsub = await tx.signAndSend(userKeyring, (result) => {
    if (result.status.isInBlock || result.status.isFinalized) {
      console.log("Block finalized 3");
      unsub();
    }
  });
} catch (err) {
  console.log("error", err.toString());
}

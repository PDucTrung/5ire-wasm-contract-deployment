import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync.js";

const adapter = new FileSync("data.json");
const db = low(adapter);

db.defaults({ contracts: [] }).write();

// export function delay(sec) {
//   return new Promise((res) => setTimeout(res, sec));
// }

export function createDb(contract) {
  db.get("contracts").push(contract).write();
}

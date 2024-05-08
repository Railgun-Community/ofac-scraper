import { getFilteredLogs } from "./ofac/filter";
import fs from "fs";

import { OFAC_SANCTIONS_LIST_ADDRESSES } from "@railgun-community/shared-models";
import { startAnvil } from "./anvil";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const main = async () => {
  const anvil = await startAnvil();
  setTimeout(async () => {
    const logs = await getFilteredLogs();
    const outputList = OFAC_SANCTIONS_LIST_ADDRESSES;
    const list: string[] = [];
    for (const log of logs) {
      // @ts-expect-error
      const { addrs } = log.args;
      for (const addr of addrs) {
        if (
          !list.includes(addr) &&
          !OFAC_SANCTIONS_LIST_ADDRESSES.includes(addr.toLowerCase())
        ) {
          list.push(addr);
          outputList.push(addr);
        }
      }
    }
    // write to file
    const listBlock = JSON.stringify(outputList, null, 2);
    const outputFile = `export const OFAC_SANCTIONS_LIST_ADDRESSES = ${listBlock}.map(address => address.toLowerCase());`;

    fs.writeFileSync("blocked-addresses.ts", outputFile);
    await anvil.stop();
    process.exit(0);
  }, 5000);
};

main().catch(() => process.exit(1));

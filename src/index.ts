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
    const wholeFoundList: string[] = [];
    const needToAdd: string[] = [];
    for (const log of logs) {
      // @ts-expect-error
      const { addrs } = log.args;
      for (const addr of addrs) {
        if (!needToAdd.includes(addr)) {
          if (!OFAC_SANCTIONS_LIST_ADDRESSES.includes(addr.toLowerCase())) {
            needToAdd.push(addr);
          }
        }
        if (!wholeFoundList.includes(addr)) {
          wholeFoundList.push(addr);
        }
      }
    }
    console.log("Total Found", wholeFoundList.length);
    console.log("Current List Length", OFAC_SANCTIONS_LIST_ADDRESSES.length);
    const finalList = [];
    for (let i = 0; i < OFAC_SANCTIONS_LIST_ADDRESSES.length; i++) {
      const addr = OFAC_SANCTIONS_LIST_ADDRESSES[i];
      const replacementValue = wholeFoundList.find(
        (a) => a.toLowerCase() === addr
      );
      if (replacementValue != null) {
        finalList[i] = replacementValue;
      }
    }
    finalList.push(...needToAdd);
    console.log("New Addresses Found", needToAdd.length);

    const listBlock = JSON.stringify(finalList, null, 2);
    const outputFile = `export const OFAC_SANCTIONS_LIST_ADDRESSES = ${listBlock}.map(address => address.toLowerCase());`;

    fs.writeFileSync("blocked-addresses.ts", outputFile);
    await anvil.stop();
    process.exit(0);
  }, 5000);
};

main().catch(() => process.exit(1));

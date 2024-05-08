import { publicClient } from "../provider";
import abi from "./abi";

const CHAINALYSIS_OFAC_ORACLE_ADDRESS =
  "0x40C57923924B5c5c5455c48D93317139ADDaC8fb";

export const getFilter = async () => {
  const filter = await publicClient.createContractEventFilter({
    abi,
    address: CHAINALYSIS_OFAC_ORACLE_ADDRESS,
    eventName: "SanctionedAddressesAdded",
    //@ts-expect-error
    fromBlock: 14356508n,
    toBlock: "latest",
  });
  return filter;
};

export const getFilteredLogs = async () => {
  const filter = await getFilter();
  const logs = await publicClient.getFilterLogs({ filter });
  return logs;
};

import { createAnvil } from "@viem/anvil";

let anvil: any;

export const startAnvil = async () => {
  anvil = createAnvil({
    stepsTracing: true,
    chainId: 1,
    port: 8545,
    forkUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  });

  anvil.start();
  return anvil;
};

process.on("SIGINT", () => {
  if (!anvil) return;
  anvil.stop();
});

import {ethers, Wallet} from "ethers";
import {deployDepositContract} from "./deposit-test-util";
import hdkey from "ethereumjs-wallet/hdkey";
import {Keypair as KeyPair} from "@chainsafe/bls/lib/keypair";
import {PrivateKey} from "@chainsafe/bls/lib/privateKey";
import {toHexString} from "../../../../src/renderer/services/utils/crypto-utils";
import {DepositTx, generateDeposit} from "../../../../src/renderer/services/deposit";

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const ganache = require("ganache-cli");

describe("Deposit transaction service unit tests", () => {
    let wallet: Wallet;
    let provider: ethers.providers.Web3Provider;
    let depositContractAddress: string;

    beforeAll(async () => {
        // create accounts and deploy deposit contract
        const deployPrivateKey = hdkey.fromMasterSeed(Buffer.from([0])).getWallet().getPrivateKey();
        const accountPrivateKey = hdkey.fromMasterSeed(Buffer.from([1])).getWallet().getPrivateKey();
        provider = new ethers.providers.Web3Provider(ganache.provider({
            accounts: [{
                balance: "100000000000000000000",
                secretKey: toHexString(accountPrivateKey),
            },
            {
                balance: "100000000000000000000",
                secretKey: toHexString(deployPrivateKey),
            }],
        }));
        wallet = new ethers.Wallet(accountPrivateKey, provider);
        depositContractAddress = await deployDepositContract(provider, toHexString(deployPrivateKey));
    });

    it("should send deposit transaction successfully", async () => {
        const keyPair = new KeyPair(PrivateKey.fromHexString(wallet.privateKey));
        const depositData = generateDeposit(keyPair, Buffer.alloc(48, 1,"hex"));
        const depositTx = DepositTx.generateDepositTx(depositData, depositContractAddress);
        const signedTx = await depositTx.sign(wallet);
        const transactionResponse = await provider.sendTransaction(toHexString(signedTx));
        expect(transactionResponse).toBeDefined();
        expect(transactionResponse.hash).toBeDefined();
        if (transactionResponse.hash) {
            const receipt = await provider.getTransactionReceipt(transactionResponse.hash);
            expect(receipt).toBeDefined();
            expect(receipt.confirmations).toBeGreaterThan(0);
            expect(receipt.status).toBe(1);
        }
    });
});

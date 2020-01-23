import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import {config} from "@chainsafe/eth2.0-config/lib/presets/mainnet";
import {
    setDepositVisible, 
    setDepositTransactionData, 
    generateDepositAction
} from "../../../../src/renderer/actions";
import {DEPOSIT_AMOUNT} from "../../../../src/renderer/services/deposit/constants";
import {IRootState} from "../../../../src/renderer/reducers";
import {IRegisterState} from "../../../../src/renderer/reducers/register";
import {IDepositState} from "../../../../src/renderer/reducers/deposit";
import {Keypair} from "@chainsafe/bls/lib/keypair";
import {PrivateKey} from "@chainsafe/bls/lib/privateKey";
import {generateDeposit, DepositTx} from "../../../../src/renderer/services/deposit";
import {IAuthState} from "../../../../src/renderer/reducers/auth";
import {IAddValidatorState} from "../../../../src/renderer/reducers/addValidator";

const privateKeyStr = "0xd68ffdb8b9729cb02c5be506e9a2fad086746b4bdc2f50fb74d10ac8419c5259";
const publicKeyStr =
    "0x92fffcc44e690220c190be41378baf6152560eb13fa73bdf8b45120b56096acc4b4e87a0e0b97f83e48f0ff4990daa18";

const initialState: IRootState = {
    register: {
        signingKey: privateKeyStr,
        withdrawalKey: publicKeyStr
    } as IRegisterState,
    deposit: {} as IDepositState,
    auth: {} as IAuthState,
    addValidator: {} as IAddValidatorState
};


describe("deposit actions", () => {
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    const reduxStore = mockStore(initialState);

    beforeEach(() => {
        reduxStore.clearActions();
    });


    it("should dispatch deposit tx data action", () => {
        const expectedActions = [
            setDepositTransactionData("mock")
        ];
        reduxStore.dispatch<any>(setDepositTransactionData("mock"));

        expect(reduxStore.getActions()).toEqual(expectedActions);
    });

    it("should dispatch generate deposit action", () => {
        const networkConfig = {
            config,
            networkId: 0,
            contract: {
                address: "0x0",
                bytecode: "",
                deployedAtBlock: 0
            }
        };

        const keyPair = new Keypair(PrivateKey.fromHexString(privateKeyStr));
        // Call deposit service and dispatch action
        const depositData = generateDeposit(keyPair, Buffer.from(publicKeyStr, "hex"), DEPOSIT_AMOUNT);
        const depositTx = DepositTx.generateDepositTx(
            depositData, 
            networkConfig.contract.address, 
            networkConfig.config, 
            DEPOSIT_AMOUNT);
        const txData = `0x${depositTx.data.toString("hex")}`;

        const expectedActions = [
            setDepositTransactionData(txData)
        ];

        reduxStore.dispatch<any>(generateDepositAction(networkConfig, DEPOSIT_AMOUNT));

        expect(reduxStore.getActions()).toEqual(expectedActions);
    });

    it("should dispatch visible action", () => {
        const expectedActions = [
            setDepositVisible(true)
        ];
        reduxStore.dispatch<any>(setDepositVisible(true));

        expect(reduxStore.getActions()).toEqual(expectedActions);

    });
});

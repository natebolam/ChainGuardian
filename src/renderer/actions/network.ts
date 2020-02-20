import {PrivateKey} from "@chainsafe/bls/lib/privateKey";

import {BeaconChain, SupportedNetworks} from "../services/docker/chain";
import {DockerRegistry} from "../services/docker/docker-registry";
import {NetworkActionTypes} from "../constants/action-types";
import {Action, Dispatch} from "redux";
import {IRootState} from "../reducers";
import {BeaconNode} from "../models/beaconNode";
import database from "../services/db/api/database";
import {DEFAULT_ACCOUNT} from "../constants/account";

export const startBeaconChainAction = (network: string, ports?: string[]) => {
    return async (): Promise<void> => {
        switch(network) {
            case SupportedNetworks.PRYSM:
                await BeaconChain.startPrysmBeaconChain(ports);
                break;
            default:
                await BeaconChain.startPrysmBeaconChain(ports);
        }
    };
};

export const stopBeaconChainAction = (network = SupportedNetworks.PRYSM) => {
    return async (): Promise<void> => {
        const container = DockerRegistry.getContainer(network);
        if (container) {
            await container.stop();
        }
    };
};

export const restartBeaconChainAction = (network = SupportedNetworks.PRYSM) => {
    return async (): Promise<void> => {
        const container = DockerRegistry.getContainer(network);
        if (container) {
            await container.restart();
        }
    };
};

export interface ISaveSelectedNetworkAction {
    type: typeof NetworkActionTypes.SELECT_NETWORK;
    payload: string;
}
export const saveSelectedNetworkAction = (network: string): ISaveSelectedNetworkAction => ({
    type: NetworkActionTypes.SELECT_NETWORK,
    payload: network,
});

export const saveBeaconNodeAction = (url: string) => {
    return async (dispatch: Dispatch<Action<unknown>>, getState: () => IRootState): Promise<void> => {
        const signingKey = PrivateKey.fromBytes(
            Buffer.from(getState().register.signingKey.replace("0x",""), "hex")
        );
        const validatorAddress = signingKey.toPublicKey().toHexString();
        const beaconNode = new BeaconNode({
            url,
            validatorAddress,
        });

        await database.beaconNode.set(
            DEFAULT_ACCOUNT,
            beaconNode,
        );
    };
};

import {ValidatorResponse} from "@chainsafe/lodestar-types";
import {Action} from "redux";

import {ILoadedValidatorAction} from "../actions/validator";
import {ValidatorActionTypes} from "../constants/action-types";

export interface IValidatorState {
    [validatorAddress: string]: ValidatorResponse;
}

const initialState: IValidatorState = {
};

export const validatorsReducer = (
    state = initialState,
    action: Action<ValidatorActionTypes>
): IValidatorState => {
    let payload;
    switch (action.type) {
        case ValidatorActionTypes.LOADED_VALIDATOR:
            payload = (action as ILoadedValidatorAction).payload;
            return {
                ...state,
                validators: {
                    ...state.validators,
                    [payload.pubkey.toString()]: payload
                }
            };
        default:
            return state;
    }
};

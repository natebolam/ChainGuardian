import {ContainerType} from "@chainsafe/ssz";
import {StringType} from "./basic";
import {Settings} from "../settings";

export const SettingsType = new ContainerType<Settings>({
    fields: {
        "dockerPath": new StringType()
    }
});

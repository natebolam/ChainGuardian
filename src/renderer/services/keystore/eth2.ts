import {ICGKeystore, ICGKeystoreFactory} from "./interface";
import {Keypair} from "@chainsafe/bls";
import {existsSync, readFileSync, unlinkSync, writeFileSync,mkdirSync} from "fs";
import {PrivateKey} from "@chainsafe/bls";
import {Keystore, IKeystore} from "@nodefactory/bls-keystore";
import {dirname} from "path";
import {warn} from "electron-log";

const KEY_PATH = "m/12381/3600/i/0/0";
export class V4Keystore implements ICGKeystore {
    private keystore: IKeystore;
    private readonly file: string;

    public constructor(file: string) {
        this.keystore = this.readKeystoreFile(file);
        this.file = file;
    }


    /**
     * Static method to create keystore file and ICGKeystore instance
     * @param file file path
     * @param password password for encryption
     * @param keypair private and public key
     */
    public static async create(file: string, password: string, keypair: Keypair): Promise<ICGKeystore> {
        try {
            const keystore = Keystore.encrypt(keypair.privateKey.toBytes(), password, KEY_PATH);
            ensureKeystoreDirectory(file);
            writeFileSync(file, keystore.toJSON());
            return new V4Keystore(file);
        } catch (err) {
            throw new Error(`Failed to write to ${file}: ${err}`);
        }
    }

    /**
     * Method used to decrypt encrypted private key from keystore file
     * @param password
     */
    public async decrypt(password: string): Promise<Keypair> {
        const privateKeyBuffer: Buffer = this.keystore.decrypt(password);
        const priv = PrivateKey.fromBytes(privateKeyBuffer);
        return new Keypair(priv);
    }

    /**
     * Replacing old password with new password which also change physical keystore file on disk
     *
     * @param oldPassword old password to decrypt private key
     * @param newPassword new password to encrypt private key
     */
    public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        const keypair = await this.decrypt(oldPassword);
        const keystore = Keystore.encrypt(keypair.privateKey.toBytes(), newPassword);
        try {
            ensureKeystoreDirectory(this.file);
            writeFileSync(this.file, keystore.toJSON());
            this.keystore = keystore;
        } catch (err) {
            throw new Error(`Failed to write to ${this.file}: ${err}`);
        }
    }

    public getPublicKey(): string {
        return `0x${this.keystore.pubkey}`;
    }

    /**
     * Deletes physical keystore file
     */
    public destroy(): void {
        try {
            unlinkSync(this.file);
        } catch (err) {
            throw new Error(`Failed to delete file ${this.file}: ${err}`);
        }
    }

    /**
     * Helper method to read file from path specified by @param file
     * @param file file path
     */
    private readKeystoreFile(file: string): IKeystore {
        if (existsSync(file)) {
            try {
                const data = readFileSync(file);
                return Keystore.fromJSON(data.toString());
            } catch (err) {
                throw new Error(`${file} could not be parsed: ${err}`);
            }
        }
        throw new Error(`Cannot find file ${file}`);
    }

}

export const V4KeystoreFactory: ICGKeystoreFactory = V4Keystore;

function ensureKeystoreDirectory(file: string): void{
    try {
        mkdirSync(dirname(file), {recursive: true});
    }
    catch (err) {
        warn("ensuring directory exists", err);
    }
}

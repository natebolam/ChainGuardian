import bls from '@chainsafe/bls';
import { Keypair } from '@chainsafe/bls/lib/keypair';
import { BLSPubkey, BLSSecretKey } from '@chainsafe/bls/lib/types';
import { PrivateKey } from '@chainsafe/bls/lib/privateKey';
import { PublicKey } from '@chainsafe/bls/lib/publicKey';
import Keystore from './Keystore';

export class WalletService {
    keypair: Keypair;
    keystore: Keystore;

    constructor(keypair: Keypair) {
        this.keypair = keypair;
        this.keystore = new Keystore(this.keypair);
    }

    getPrivateKey(): PrivateKey {
        return this.keypair.privateKey;
    }

    getPublicKey(): PublicKey {
        return this.keypair.publicKey;
    }

    getKeypair(): Keypair {
        return this.keypair;
    }

    getKeystore(): Keystore {
        return this.keystore;
    }

    static generateKeypair(): WalletService {
        return new WalletService(bls.generateKeyPair());
    }

    static fromPrivateKeyHexString(privateKeyString: string): WalletService {
        const priv = PrivateKey.fromHexString(privateKeyString);
        const pub = PublicKey.fromBytes(PublicKey.fromPrivateKey(priv).toBytesCompressed());
        return new WalletService(new Keypair(priv, pub));
    }

    static generatePublicKey(secretKey: BLSSecretKey): BLSPubkey {
        return bls.generatePublicKey(secretKey);
    }
}

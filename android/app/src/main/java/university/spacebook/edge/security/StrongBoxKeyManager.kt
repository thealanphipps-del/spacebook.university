package university.spacebook.edge.security

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature

/**
 * StrongBox Hardware Keystore Manager
 * Implements hardware-enclave key generation and cryptographic challenge signing
 * under SPU-0008 and RFC-0025 privacy/sovereignty requirements.
 */
class StrongBoxKeyManager(private val context: Context) {

    companion object {
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
        private const val ALIAS_HOT_WALLET = "spacebook_attn_hot_wallet"
        private const val ALIAS_MESH_IDENTITY = "spacebook_mesh_identity"
    }

    private val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }

    fun getOrCreateHotWalletKey(): KeyPair {
        if (!keyStore.containsAlias(ALIAS_HOT_WALLET)) {
            val kpg = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, ANDROID_KEYSTORE)
            val builder = KeyGenParameterSpec.Builder(
                ALIAS_HOT_WALLET,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            ).apply {
                setDigests(KeyProperties.DIGEST_SHA256, KeyProperties.DIGEST_SHA512)
                setUserAuthenticationRequired(false) // Triggered via BiometricPrompt.CryptoObject for settlement
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    // Enforce StrongBox hardware security module if available on device
                    try {
                        setIsStrongBoxBacked(true)
                    } catch (_: Exception) {
                        // Fall back to standard TEE if StrongBox chip absent
                    }
                }
            }
            kpg.initialize(builder.build())
            return kpg.generateKeyPair()
        }
        val entry = keyStore.getEntry(ALIAS_HOT_WALLET, null) as KeyStore.PrivateKeyEntry
        return KeyPair(entry.certificate.publicKey, entry.privateKey)
    }

    fun signChallenge(challengeNonce: ByteArray): ByteArray {
        val entry = keyStore.getEntry(ALIAS_HOT_WALLET, null) as? KeyStore.PrivateKeyEntry
            ?: throw IllegalStateException("Hot wallet key entry not initialized in StrongBox")
        
        val signer = Signature.getInstance("SHA256withECDSA").apply {
            initSign(entry.privateKey)
            update(challengeNonce)
        }
        return signer.sign()
    }

    fun getPublicKeyHex(): String {
        val keyPair = getOrCreateHotWalletKey()
        return keyPair.public.encoded.joinToString("") { "%02x".format(it) }
    }
}

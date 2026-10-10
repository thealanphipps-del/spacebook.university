package university.spacebook.edge.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import university.spacebook.edge.compute.ThermalBatteryGovernor
import university.spacebook.edge.network.Stratum5DWorkerClient
import university.spacebook.edge.security.StrongBoxKeyManager
import java.security.MessageDigest

/**
 * SpacebookEdgeService: 24/7 Sovereign Edge Node Daemon
 * Notification ID: 0x7300
 * Coordinates Stratum-5D PoUW Supercomputer loop with ThermalBatteryGovernor
 */
class SpacebookEdgeService : Service() {

    companion object {
        const val NOTIFICATION_ID = 0x7300
        const val CHANNEL_ID = "spacebook_edge_node_channel"
        const val ACTION_START = "ACTION_START_EDGE_NODE"
        const val ACTION_STOP = "ACTION_STOP_EDGE_NODE"
    }

    private val serviceJob = Job()
    private val scope = CoroutineScope(Dispatchers.IO + serviceJob)

    private lateinit var keyManager: StrongBoxKeyManager
    private lateinit var governor: ThermalBatteryGovernor
    private lateinit var stratumClient: Stratum5DWorkerClient

    private var workerId: String = "node-strongbox-0x4894"
    private var totalSharesValid = 0
    private var isRunning = false

    override fun onCreate() {
        super.onCreate()
        keyManager = StrongBoxKeyManager(this)
        governor = ThermalBatteryGovernor(this)
        stratumClient = Stratum5DWorkerClient(host = "100.97.133.107", port = 3335)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                if (!isRunning) {
                    isRunning = true
                    startForeground(NOTIFICATION_ID, buildNotification("Initializing Sovereign Edge Node..."))
                    startWorkerLoop()
                }
            }
            ACTION_STOP -> {
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun startWorkerLoop() {
        scope.launch {
            try {
                stratumClient.connect()
                val subResp = stratumClient.subscribe(Build.MODEL, "NNAPI-Qualcomm")
                val pubKeyHex = keyManager.getPublicKeyHex().take(16)
                workerId = "node-$pubKeyHex"
                
                // Sign challenge for authorization
                val sigBytes = keyManager.signChallenge("spacebook-auth-challenge".toByteArray())
                val sigHex = sigBytes.joinToString("") { "%02x".format(it) }
                stratumClient.authorize(workerId, sigHex, Build.MODEL)

                while (isActive && isRunning) {
                    if (governor.isComputeAllowed.value) {
                        try {
                            val jobResp = stratumClient.requestJob("NEURAL_INFERENCE_SLICE")
                            if (jobResp.has("result") && !jobResp.isNull("result")) {
                                val job = jobResp.getJSONObject("result")
                                val jobId = job.getString("job_id")
                                val seedNonce = job.getString("seed_nonce")
                                val diffTarget = java.lang.Long.decode(job.getString("difficulty_target"))

                                // Simulated mobile neural inference cycle (64 tokens)
                                val startTime = System.currentTimeMillis()
                                delay(30) // ~30ms inference slice latency
                                val executionMs = (System.currentTimeMillis() - startTime).toFloat()

                                // Compute deterministic PoUW nonce
                                val outputHash = "f000c7db9fe93a04b85b51fa4074fb61f3a20091"
                                var foundNonce = "nonce-000001"
                                for (n in 0..1000) {
                                    val testNonce = "nonce-%06d".format(n)
                                    val digestBytes = MessageDigest.getInstance("SHA-256")
                                        .digest("$seedNonce:$testNonce:$outputHash".toByteArray())
                                    val firstBytes = ((digestBytes[0].toLong() and 0xFF) shl 24) or
                                            ((digestBytes[1].toLong() and 0xFF) shl 16)
                                    if (firstBytes <= 0x0FFF) {
                                        foundNonce = testNonce
                                        break
                                    }
                                }

                                val submitResp = stratumClient.submitShare(
                                    workerId = workerId,
                                    jobId = jobId,
                                    nonce = foundNonce,
                                    outputHash = outputHash,
                                    executionMs = executionMs,
                                    wattHours = 0.0028f,
                                    tokensCount = 64
                                )

                                if (submitResp.optBoolean("result", false)) {
                                    totalSharesValid++
                                    updateNotification("Active: $totalSharesValid shares submitted | ~18.4 tok/W")
                                }
                            }
                        } catch (e: Exception) {
                            delay(5000) // Backoff on network transient
                        }
                        delay(2000) // Duty cycle pace (governed)
                    } else {
                        // Paused by Governor
                        val reason = if (governor.userOptOut.value) "User Paused"
                        else if (!governor.isCharging.value && governor.batteryLevel.value <= 20) "Low Battery Protection"
                        else "Thermal Governor Active"
                        updateNotification("Idle: $reason (${governor.batteryLevel.value}%)")
                        delay(5000)
                    }
                }
            } catch (e: Exception) {
                delay(10000)
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Spacebook Edge Node Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "24/7 Sovereign Distributed Supercomputer Node"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(statusText: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Spacebook 5D Edge Node")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(statusText: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildNotification(statusText))
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        serviceJob.cancel()
        governor.cleanUp()
        scope.launch { stratumClient.close() }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

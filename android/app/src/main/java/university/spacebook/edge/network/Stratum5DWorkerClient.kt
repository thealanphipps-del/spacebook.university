package university.spacebook.edge.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.Socket
import java.util.concurrent.atomic.AtomicInteger

/**
 * Stratum-5D Mobile Edge Worker Client
 * Connects to Spacebook Global Supercomputer Pool on Port 3335 (TCP)
 * Implements SPU-0008 & SPU-0009 JSON-RPC 2.0 PoUW Protocol
 */
class Stratum5DWorkerClient(
    private val host: String = "100.97.133.107",
    private val port: Int = 3335
) {
    private var socket: Socket? = null
    private var reader: BufferedReader? = null
    private var writer: OutputStreamWriter? = null
    private val reqCounter = AtomicInteger(1)

    var isConnected: Boolean = false
        private set

    suspend fun connect() = withContext(Dispatchers.IO) {
        val s = Socket(host, port)
        s.soTimeout = 15000
        socket = s
        reader = BufferedReader(InputStreamReader(s.getInputStream()))
        writer = OutputStreamWriter(s.getOutputStream())
        isConnected = true
    }

    suspend fun close() = withContext(Dispatchers.IO) {
        try {
            socket?.close()
        } catch (_: Exception) {}
        socket = null
        reader = null
        writer = null
        isConnected = false
    }

    private suspend fun sendRpc(method: String, params: Any): JSONObject = withContext(Dispatchers.IO) {
        if (socket == null || socket?.isConnected != true) {
            connect()
        }
        val id = reqCounter.getAndIncrement()
        val req = JSONObject().apply {
            put("id", id)
            put("method", method)
            put("params", params)
        }

        val line = req.toString() + "\n"
        writer?.write(line)
        writer?.flush()

        val respLine = reader?.readLine() ?: throw IllegalStateException("Stratum-5D connection closed by peer")
        JSONObject(respLine)
    }

    suspend fun subscribe(modelName: String, npuBackend: String): JSONObject {
        val params = JSONArray().apply {
            put(JSONObject().apply {
                put("model", modelName)
                put("npu", npuBackend)
                put("app_version", "1.0.0-spu")
            })
        }
        return sendRpc("spacebook.edge.subscribe", params)
    }

    suspend fun authorize(workerId: String, signatureHex: String, deviceModel: String): JSONObject {
        val params = JSONArray().apply {
            put(workerId)
            put(signatureHex)
            put(JSONObject().apply {
                put("model", deviceModel)
            })
        }
        return sendRpc("spacebook.edge.authorize", params)
    }

    suspend fun requestJob(workType: String = "NEURAL_INFERENCE_SLICE"): JSONObject {
        val params = JSONArray().apply {
            put(workType)
        }
        return sendRpc("spacebook.compute.job.request", params)
    }

    suspend fun submitShare(
        workerId: String,
        jobId: String,
        nonce: String,
        outputHash: String,
        executionMs: Float,
        wattHours: Float,
        tokensCount: Int
    ): JSONObject {
        val metrics = JSONObject().apply {
            put("execution_ms", executionMs.toDouble())
            put("watt_hours", wattHours.toDouble())
            put("tokens", tokensCount)
        }
        val params = JSONArray().apply {
            put(workerId)
            put(jobId)
            put(nonce)
            put(outputHash)
            put(metrics)
        }
        return sendRpc("spacebook.compute.submit", params)
    }

    suspend fun fetchStatus(): JSONObject {
        return sendRpc("spacebook.edge.status", JSONArray())
    }
}

package university.spacebook.edge.compute

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Thermal & Battery Governor
 * Enforces Hypothesis H-005 Participant Experience & Usability Invariant:
 * 1. Automatically suspends background inference if battery < 20% while discharging.
 * 2. Throttles or halts if thermal status reaches STATUS_WARNING or higher.
 * 3. Provides clean opt-out tracking state.
 */
class ThermalBatteryGovernor(private val context: Context) {

    private val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    
    private val _isComputeAllowed = MutableStateFlow(true)
    val isComputeAllowed: StateFlow<Boolean> = _isComputeAllowed.asStateFlow()

    private val _batteryLevel = MutableStateFlow(100)
    val batteryLevel: StateFlow<Int> = _batteryLevel.asStateFlow()

    private val _isCharging = MutableStateFlow(false)
    val isCharging: StateFlow<Boolean> = _isCharging.asStateFlow()

    private val _thermalStatus = MutableStateFlow("NOMINAL")
    val thermalStatus: StateFlow<String> = _thermalStatus.asStateFlow()

    private val _userOptOut = MutableStateFlow(false)
    val userOptOut: StateFlow<Boolean> = _userOptOut.asStateFlow()

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            intent?.let {
                val level = it.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = it.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                if (level != -1 && scale != -1) {
                    _batteryLevel.value = (level * 100 / scale.toFloat()).toInt()
                }
                val status = it.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                _isCharging.value = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                        status == BatteryManager.BATTERY_STATUS_FULL
                reevaluate()
            }
        }
    }

    init {
        // Register battery monitor
        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        context.registerReceiver(batteryReceiver, filter)

        // Register thermal monitor (API 29+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            powerManager.addThermalStatusListener { status ->
                _thermalStatus.value = when (status) {
                    PowerManager.THERMAL_STATUS_NONE -> "NONE"
                    PowerManager.THERMAL_STATUS_LIGHT -> "LIGHT"
                    PowerManager.THERMAL_STATUS_MODERATE -> "MODERATE"
                    PowerManager.THERMAL_STATUS_SEVERE -> "SEVERE"
                    PowerManager.THERMAL_STATUS_CRITICAL -> "CRITICAL"
                    PowerManager.THERMAL_STATUS_EMERGENCY -> "EMERGENCY"
                    PowerManager.THERMAL_STATUS_SHUTDOWN -> "SHUTDOWN"
                    else -> "UNKNOWN"
                }
                reevaluate()
            }
        }
    }

    fun setUserOptOut(optOut: Boolean) {
        _userOptOut.value = optOut
        reevaluate()
    }

    private fun reevaluate() {
        if (_userOptOut.value) {
            _isComputeAllowed.value = false
            return
        }

        // Suspend compute if discharging and battery <= 20%
        if (!_isCharging.value && _batteryLevel.value <= 20) {
            _isComputeAllowed.value = false
            return
        }

        // Suspend compute if thermal status severe or higher
        val thermal = _thermalStatus.value
        if (thermal == "SEVERE" || thermal == "CRITICAL" || thermal == "EMERGENCY" || thermal == "SHUTDOWN") {
            _isComputeAllowed.value = false
            return
        }

        _isComputeAllowed.value = true
    }

    fun cleanUp() {
        try {
            context.unregisterReceiver(batteryReceiver)
        } catch (_: Exception) {}
    }
}

package university.spacebook.edge.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import university.spacebook.edge.compute.ThermalBatteryGovernor
import university.spacebook.edge.security.StrongBoxKeyManager
import university.spacebook.edge.service.SpacebookEdgeService

class MainActivity : ComponentActivity() {

    private lateinit var keyManager: StrongBoxKeyManager
    private lateinit var governor: ThermalBatteryGovernor

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        keyManager = StrongBoxKeyManager(this)
        governor = ThermalBatteryGovernor(this)

        setContent {
            SpacebookTheme {
                EdgeNodeDashboard(
                    keyManager = keyManager,
                    governor = governor,
                    onStartService = {
                        val intent = Intent(this, SpacebookEdgeService::class.java).apply {
                            action = SpacebookEdgeService.ACTION_START
                        }
                        startService(intent)
                    },
                    onStopService = {
                        val intent = Intent(this, SpacebookEdgeService::class.java).apply {
                            action = SpacebookEdgeService.ACTION_STOP
                        }
                        startService(intent)
                    }
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        governor.cleanUp()
    }
}

@Composable
fun SpacebookTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF0A0F1E),
            surface = Color(0xFF0F172A),
            primary = Color(0xFF38BDF8),
            secondary = Color(0xFFA855F7),
            tertiary = Color(0xFF22C55E)
        ),
        content = content
    )
}

@Composable
fun EdgeNodeDashboard(
    keyManager: StrongBoxKeyManager,
    governor: ThermalBatteryGovernor,
    onStartService: () -> Unit,
    onStopService: () -> Unit
) {
    val batteryLevel by governor.batteryLevel.collectAsState()
    val isCharging by governor.isCharging.collectAsState()
    val thermalStatus by governor.thermalStatus.collectAsState()
    val isComputeAllowed by governor.isComputeAllowed.collectAsState()
    val userOptOut by governor.userOptOut.collectAsState()

    var isServiceRunning by remember { mutableStateOf(false) }
    var greenZoneEnabled by remember { mutableStateOf(true) }
    var yellowZoneEnabled by remember { mutableStateOf(true) }
    var redZoneBlocked by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0F1E))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // App Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "SPACEBOOK 5D",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF38BDF8),
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "Sovereign Edge Node • SPU Phase I",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )
            }
            Surface(
                color = if (isComputeAllowed && isServiceRunning) Color(0x2622C55E) else Color(0x26EAB308),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (isComputeAllowed && isServiceRunning) "NODE ONLINE" else "IDLE / PROTECTED",
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isComputeAllowed && isServiceRunning) Color(0xFF86EFAC) else Color(0xFFFDE047)
                )
            }
        }

        // Card 1: Stratum-5D Distributed Supercomputer
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "⚡ Stratum-5D Supercomputer Worker",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Proof-of-Useful-Work (PoUW) • Ports 3335 (TCP) / 3336 (QUIC)",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )

                Divider(color = Color(0x1AFFFFFF))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    MetricBadge("Efficiency", "18.4 tok/W", Color(0xFF67E8F9))
                    MetricBadge("Sync Delay", "32ms", Color(0xFF86EFAC))
                    MetricBadge("Opt-Out (H-005)", if (userOptOut) "PAUSED" else "0.0%", Color(0xFFFDE047))
                }

                Spacer(modifier = Modifier.height(4.dp))

                Button(
                    onClick = {
                        if (isServiceRunning) {
                            onStopService()
                            isServiceRunning = false
                        } else {
                            onStartService()
                            isServiceRunning = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isServiceRunning) Color(0xFFEF4444) else Color(0xFF0284C7)
                    )
                ) {
                    Text(text = if (isServiceRunning) "Stop Edge Service" else "Launch 24/7 Edge Node")
                }
            }
        }

        // Card 2: Usability & Participant Experience (H-005)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "🔋 Usability & Lifeforce Governor (H-005)",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Battery: $batteryLevel% (${if (isCharging) "Charging" else "Discharging"}) • Thermal: $thermalStatus",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Contribute Distributed Compute",
                        fontSize = 13.sp,
                        color = Color.White
                    )
                    Switch(
                        checked = !userOptOut,
                        onCheckedChange = { governor.setUserOptOut(!it) }
                    )
                }
            }
        }

        // Card 3: Granular Consent Matrix (RFC-0025)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "🛡️ Granular Consent Matrix (RFC-0025)",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Enforce sovereign privacy boundaries on local edge sensor exhaust.",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )

                ConsentRow("🟢 Green Zone (Public Knowledge & PoUW Shares)", greenZoneEnabled) { greenZoneEnabled = it }
                ConsentRow("🟡 Yellow Zone (Differential Privacy DP-SGD)", yellowZoneEnabled) { yellowZoneEnabled = it }
                ConsentRow("🔴 Red Zone (Private Enclave Locked • Zero Egress)", redZoneBlocked) { redZoneBlocked = it }
            }
        }

        // Card 4: Hardware Enclave & StrongBox Security
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "🔐 Hardware StrongBox Security Enclave",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Hot Wallet Key: Hardware Isolated (Non-Exportable)",
                    fontSize = 12.sp,
                    color = Color(0xFF86EFAC)
                )
                Text(
                    text = "Public Key: ${keyManager.getPublicKeyHex().take(24)}...",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Color(0xFF94A3B8)
                )
            }
        }
    }
}

@Composable
fun MetricBadge(label: String, value: String, valueColor: Color) {
    Column {
        Text(text = label, fontSize = 11.sp, color = Color(0xFF94A3B8))
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = valueColor,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun ConsentRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 12.sp, color = Color(0xFFE2E8F0), modifier = Modifier.weight(1f))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

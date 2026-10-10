"""
Automated Integration Tests for Stratum-5D Supercomputer Server
Validates protocol negotiation, cryptographic authorization, job generation, PoUW share submission, and telemetry.
"""

import asyncio
import json
import socket
import threading
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.stratum_5d_server import Stratum5DServer

def run_test_server():
    server = Stratum5DServer()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def starter():
        s_srv = await asyncio.start_server(server.handle_client, "127.0.0.1", 3335)
        t_srv = await asyncio.start_server(server.handle_telemetry_http, "127.0.0.1", 3337)
        return s_srv, t_srv

    s_srv, t_srv = loop.run_until_complete(starter())
    
    # Run in thread
    t = threading.Thread(target=loop.run_forever, daemon=True)
    t.start()
    return server, loop

def send_rpc(sock, method, params, req_id=1):
    msg = json.dumps({"id": req_id, "method": method, "params": params}) + "\n"
    sock.sendall(msg.encode())
    resp_line = sock.makefile().readline()
    return json.loads(resp_line.strip())

def test_stratum_5d_flow():
    server, loop = run_test_server()
    time.sleep(0.5)

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("127.0.0.1", 3335))

    # 1. Subscribe
    sub_resp = send_rpc(s, "spacebook.edge.subscribe", [{"model": "Pixel 8 Pro", "npu": "Tensor G3"}], req_id=101)
    assert sub_resp["error"] is None
    assert len(sub_resp["result"]) == 5
    sub_id, extranonce1, extranonce2_sz, diff_target, epoch = sub_resp["result"]
    assert epoch == 73
    assert int(diff_target, 16) > 0
    print("[PASS] Stratum-5D Subscribe verified:", sub_id)

    # 2. Authorize
    auth_resp = send_rpc(s, "spacebook.edge.authorize", ["node-strongbox-0x4894", "sig-proof-alpha", {"model": "Pixel 8 Pro"}], req_id=102)
    assert auth_resp["error"] is None
    assert auth_resp["result"] is True
    print("[PASS] Stratum-5D Authorize verified")

    # 3. Get Neural Job
    job_resp = send_rpc(s, "spacebook.compute.job.request", ["NEURAL_INFERENCE_SLICE"], req_id=103)
    assert job_resp["error"] is None
    job = job_resp["result"]
    assert "job_id" in job
    assert job["work_type"] == "NEURAL_INFERENCE_SLICE"
    print("[PASS] Stratum-5D Neural Job verified:", job["job_id"])

    # 4. Mine and Submit Valid Share
    job_id = job["job_id"]
    seed_nonce = job["seed_nonce"]
    target_int = int(job["difficulty_target"], 16)

    # Find valid nonce
    import hashlib
    found_nonce = None
    output_hash = "f000c7db9fe93a04b85b51fa4074fb61f3a20091"
    for n in range(10000):
        test_n = f"nonce-{n:06d}"
        digest = hashlib.sha256(f"{seed_nonce}:{test_n}:{output_hash}".encode()).hexdigest()
        if int(digest, 16) <= target_int:
            found_nonce = test_n
            break

    assert found_nonce is not None, "Failed to find valid PoUW nonce"

    submit_resp = send_rpc(s, "spacebook.compute.submit", [
        "node-strongbox-0x4894",
        job_id,
        found_nonce,
        output_hash,
        {"execution_ms": 32.5, "watt_hours": 0.0035, "tokens": 64}
    ], req_id=104)

    assert submit_resp["error"] is None
    assert submit_resp["result"] is True
    print(f"[PASS] Stratum-5D PoUW Share Submitted & Verified with nonce: {found_nonce}")

    # 5. Check Stats via RPC
    stats_resp = send_rpc(s, "spacebook.edge.status", [], req_id=105)
    assert stats_resp["error"] is None
    stats = stats_resp["result"]
    assert stats["total_shares_valid"] >= 1
    assert stats["active_workers_count"] == 1
    assert stats["effective_tokens_per_watt"] >= 12.0
    print(f"[PASS] Stratum-5D Stats verified: {stats['effective_tokens_per_watt']} tok/W")

    s.close()

if __name__ == "__main__":
    test_stratum_5d_flow()
    print("ALL STRATUM-5D TESTS PASSED SUCCESSFULLY!")

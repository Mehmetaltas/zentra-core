#!/data/data/com.termux/files/usr/bin/bash
cd /data/data/com.termux/files/home/zentra-core-clean

echo "ZENTRA SYSTEM RUN START"

node zentra-evolution-core/src/evolution-core.js >> zentra-system.log 2>&1
node zentra-competitor-radar/src/radar.js >> zentra-system.log 2>&1
node zentra-ops/src/zentra-ops-auto.js >> zentra-system.log 2>&1
node zentra-living-core/src/living-core.js >> zentra-system.log 2>&1
node zentra-product-discovery/src/product-discovery.js >> zentra-system.log 2>&1
node zentra-task-engine/src/task-engine.js >> zentra-system.log 2>&1
node zentra-auto-exec/src/auto-exec.js >> zentra-system.log 2>&1

echo "ZENTRA SYSTEM RUN COMPLETE"
node zentra-binding-core/src/binding-engine.js >> zentra-system.log 2>&1
+

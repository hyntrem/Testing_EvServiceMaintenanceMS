#!/bin/bash
# run-all-tests.sh
# Chạy test tất cả services, báo cáo kết quả cuối

SERVICES=(
  "user-service"
  "inventory-service"
  "booking-service"
  "finance-service"
  "maintenance-service"
  "payment-service"
  "notification-service"
  "report-service"
  "chat-service"
  "staff-service"
  "frontend"
)

FAILED=()
PASSED=()
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        MICROSERVICE TEST RUNNER          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

for service in "${SERVICES[@]}"; do
  SERVICE_DIR="$ROOT_DIR/$service"

  if [ ! -d "$SERVICE_DIR" ]; then
    echo "⚠️  Skipping $service (folder not found)"
    continue
  fi

  echo "─────────────────────────────────────────"
  echo "▶ Running: $service"
  echo "─────────────────────────────────────────"

  cd "$SERVICE_DIR" || continue

  # Load .env của service
  if [ -f ".env" ]; then
    set -a; source .env; set +a
  fi

  if npx codeceptjs run --reporter mochawesome 2>&1; then
    PASSED+=("✅ $service")
  else
    FAILED+=("❌ $service")
  fi

  cd "$ROOT_DIR" > /dev/null
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║              TEST SUMMARY                ║"
echo "╚══════════════════════════════════════════╝"

for p in "${PASSED[@]}"; do echo "  $p"; done
for f in "${FAILED[@]}"; do echo "  $f"; done

echo ""
echo "Total: ${#PASSED[@]} passed, ${#FAILED[@]} failed"

if [ ${#FAILED[@]} -ne 0 ]; then
  echo ""
  echo "❌ Some tests failed!"
  exit 1
else
  echo ""
  echo "✅ All tests passed!"
  exit 0
fi

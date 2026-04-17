#!/bin/bash
# migrate.sh
# Chạy script này 1 lần để di chuyển file cũ vào đúng thư mục service
# Chạy từ root của project: bash scripts/migrate.sh

echo "🔄 Bắt đầu migration cấu trúc tests/..."

OLD_DIR="./tests"
NEW_DIR="."   # script này nằm trong tests-restructured, chạy từ root

# ──────────────────────────────────────────
# 1. Di chuyển test files cũ vào đúng service
# ──────────────────────────────────────────
echo ""
echo "📁 Kiểm tra file cần di chuyển từ $OLD_DIR..."

# Map file cũ → service folder mới (chỉnh lại theo file thực tế của bạn)
declare -A FILE_MAP=(
  ["$OLD_DIR/login.js"]="user-service/tests/login_test.js"
  ["$OLD_DIR/test_inventory.js"]="inventory-service/tests/inventory_test.js"
  # Thêm các file khác ở đây theo format:
  # ["$OLD_DIR/ten_file_cu.js"]="ten-service/tests/ten_file_test.js"
)

for src in "${!FILE_MAP[@]}"; do
  dst="${FILE_MAP[$src]}"
  if [ -f "$src" ]; then
    mkdir -p "$(dirname $dst)"
    cp "$src" "$dst"
    echo "  ✅ Moved: $src → $dst"
  else
    echo "  ⚠️  Not found: $src (skip)"
  fi
done

# ──────────────────────────────────────────
# 2. Di chuyển thư mục con cũ (user/, booking/, payment_finance/)
# ──────────────────────────────────────────
echo ""
echo "📁 Kiểm tra folder cũ trong tests/..."

declare -A FOLDER_MAP=(
  ["$OLD_DIR/user"]="user-service/tests"
  ["$OLD_DIR/booking"]="booking-service/tests"
  ["$OLD_DIR/payment_finance"]="payment-service/tests"
  # Thêm các folder khác tại đây
)

for src in "${!FOLDER_MAP[@]}"; do
  dst="${FOLDER_MAP[$src]}"
  if [ -d "$src" ]; then
    mkdir -p "$dst"
    cp -r "$src/." "$dst/"
    echo "  ✅ Copied folder: $src → $dst"
  else
    echo "  ⚠️  Not found: $src (skip)"
  fi
done

# ──────────────────────────────────────────
# 3. Cảnh báo file .env cũ
# ──────────────────────────────────────────
if [ -f "$OLD_DIR/.env" ]; then
  echo ""
  echo "⚠️  Phát hiện $OLD_DIR/.env cũ"
  echo "   Hãy copy các biến vào từng service/.env tương ứng"
  echo "   SAU ĐÓ xóa file cũ và ĐỪNG commit .env"
fi

echo ""
echo "✅ Migration xong!"
echo ""
echo "📌 Bước tiếp theo:"
echo "   1. Kiểm tra lại các test file đã copy đúng chưa"
echo "   2. Cập nhật .env của từng service với đúng giá trị"
echo "   3. Xóa thư mục tests/ cũ khi đã confirm OK"
echo "   4. npm install (ở root)"
echo "   5. Thử chạy: npm run test:user"

from flask import Blueprint, request, jsonify, current_app
from services.inventory_service import InventoryService

internal_bp = Blueprint("internal_inventory", __name__, url_prefix="/internal/parts")

@internal_bp.before_request
def verify_internal_token():
    token = request.headers.get("X-Internal-Token")
    expected_token = current_app.config.get("INTERNAL_SERVICE_TOKEN")
    
    if not token or token != expected_token:
        return jsonify({"error": "Unauthorized internal request"}), 401

@internal_bp.route("/all", methods=["GET"])
def get_all_parts():
    parts = InventoryService.get_all_parts()
    return jsonify([p.to_dict() for p in parts]), 200


# THÊM MỚI
@internal_bp.route("/<int:item_id>/deduct", methods=["PUT"])
def deduct_part_quantity(item_id):
    data = request.get_json() or {}
    quantity_to_deduct = data.get("quantity_to_deduct")

    if quantity_to_deduct is None:
        return jsonify({"error": "Missing quantity_to_deduct"}), 400

    item, error = InventoryService.update_item(item_id, {
        "quantity_to_deduct": quantity_to_deduct
    })

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "Deduct inventory successfully",
        "item": item.to_dict()
    }), 200
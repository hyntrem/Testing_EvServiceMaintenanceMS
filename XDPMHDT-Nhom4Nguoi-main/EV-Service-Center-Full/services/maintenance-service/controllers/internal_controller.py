"""
Internal API Controller for Maintenance Service
Được gọi bởi các service khác (notification-service)
"""

from flask import Blueprint, request, jsonify, current_app
import os
from datetime import datetime, timedelta
from functools import wraps

from services.maintenance_service import MaintenanceService as service

internal_bp = Blueprint("internal", __name__, url_prefix="/internal/maintenance")
def internal_token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("X-Internal-Token")
        expected_token = current_app.config.get("INTERNAL_SERVICE_TOKEN")

        # DEBUG LOG (rất quan trọng)
        current_app.logger.info(f"Received token: {token}")
        current_app.logger.info(f"Expected token: {expected_token}")

        if not token or not expected_token:
            return jsonify({
                "success": False,
                "error": "Missing internal token"
            }), 401

        # FIX: remove "Bearer "
        if token.startswith("Bearer "):
            token = token.replace("Bearer ", "")

        # FIX: strip space
        if token.strip() != expected_token.strip():
            return jsonify({
                "success": False,
                "error": "Unauthorized - Invalid internal token"
            }), 401

        return f(*args, **kwargs)

    return decorated_function

@internal_bp.route("/due-soon", methods=["GET"])
@internal_token_required
def get_maintenance_due_soon():
    try:
        maintenances = []
        all_tasks = service.get_all_tasks()

        for task in all_tasks:
            if task.status in ['completed', 'cancelled']:
                continue

            maintenances.append({
                "id": task.task_id,
                "user_id": task.user_id,
                "vehicle_info": {
                    "license_plate": "N/A",
                    "brand": "N/A",
                    "model": task.vehicle_vin or "N/A"
                },
                "due_date": task.created_at.isoformat() if task.created_at else None,
                "task_type": "Bảo dưỡng",
                "description": task.description or "Kiểm tra định kỳ",
                "status": task.status
            })

        return jsonify({
            "success": True,
            "maintenances": maintenances,
            "count": len(maintenances)
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_maintenance_due_soon: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@internal_bp.route("/task/<int:task_id>/info", methods=["GET"])
@internal_token_required
def get_task_info(task_id):
    try:
        task = service.get_task_by_id(task_id)

        if not task:
            return jsonify({
                "success": False,
                "error": "Task not found"
            }), 404

        return jsonify({
            "success": True,
            "task": {
                "task_id": task.task_id,
                "user_id": task.user_id,
                "technician_id": task.technician_id,
                "vehicle_vin": task.vehicle_vin,
                "description": task.description,
                "status": task.status,
                "created_at": task.created_at.isoformat() if task.created_at else None,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_task_info: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@internal_bp.route("/technician/<int:technician_id>/stats", methods=["GET"])
@internal_token_required
def get_technician_stats(technician_id):
    """
    Lấy thống kê tasks của technician

    Args:
        technician_id: ID của technician (user_id)

    Returns:
        {
            "success": true,
            "stats": {
                "total_tasks": 10,
                "completed_tasks": 8,
                "in_progress_tasks": 2,
                "completion_rate": 80.0
            }
        }
    """
    try:
        all_tasks = service.get_all_tasks()

        # Filter tasks by technician_id
        tech_tasks = [t for t in all_tasks if t.technician_id == technician_id]

        total = len(tech_tasks)
        completed = len([t for t in tech_tasks if t.status == 'completed'])
        in_progress = len([t for t in tech_tasks if t.status == 'in_progress'])

        completion_rate = (completed / total * 100) if total > 0 else 0.0

        return jsonify({
            "success": True,
            "stats": {
                "total_tasks": total,
                "completed_tasks": completed,
                "in_progress_tasks": in_progress,
                "pending_tasks": total - completed - in_progress,
                "completion_rate": round(completion_rate, 2)
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in get_technician_stats: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@internal_bp.route("/health", methods=["GET"])
def internal_health():
    """Health check for internal API"""
    return jsonify({
        "success": True,
        "service": "maintenance-internal",
        "status": "healthy"
    }), 200

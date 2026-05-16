from copy import deepcopy
from datetime import datetime, timezone


def _utc_timestamp():
    return datetime.now(timezone.utc).isoformat()


def log_action(state, action_type, payload, before, after):
    log_entry = {
        "timestamp": _utc_timestamp(),
        "time_step": state["time_step"],
        "action_type": action_type,
        "payload": payload,
        "before": before,
        "after": after,
    }
    state["action_history"].append(log_entry)
    return log_entry


def _require_warehouse(state, warehouse_id):
    if warehouse_id not in state["warehouses"]:
        raise ValueError(f"Unknown warehouse: {warehouse_id}")


def _require_product(state, product_id):
    if product_id not in state["products"]:
        raise ValueError(f"Unknown product: {product_id}")


def transfer_inventory(state, product_id, from_warehouse, to_warehouse, units):
    _require_product(state, product_id)
    _require_warehouse(state, from_warehouse)
    _require_warehouse(state, to_warehouse)
    if units <= 0:
        raise ValueError("Transfer units must be positive.")
    if units > state["constraints"]["max_auto_transfer_units"]:
        raise ValueError(
            f"Transfer exceeds max_auto_transfer_units of {state['constraints']['max_auto_transfer_units']}."
        )

    source = state["warehouses"][from_warehouse]
    destination = state["warehouses"][to_warehouse]
    source_inventory = source["inventory"].get(product_id, 0)
    destination_inventory = destination["inventory"].get(product_id, 0)

    if source_inventory < units:
        raise ValueError(
            f"Source warehouse {from_warehouse} only has {source_inventory} units of {product_id}."
        )
    if destination_inventory + units > destination["capacity"]:
        raise ValueError(f"Transfer would exceed capacity at destination warehouse {to_warehouse}.")

    before = {
        from_warehouse: deepcopy(source["inventory"]),
        to_warehouse: deepcopy(destination["inventory"]),
    }
    source["inventory"][product_id] = source_inventory - units
    destination["inventory"][product_id] = destination_inventory + units
    after = {
        from_warehouse: deepcopy(source["inventory"]),
        to_warehouse: deepcopy(destination["inventory"]),
    }

    return log_action(
        state,
        "transfer_inventory",
        {
            "product_id": product_id,
            "from_warehouse": from_warehouse,
            "to_warehouse": to_warehouse,
            "units": units,
        },
        before,
        after,
    )


def update_supplier_allocation(state, allocations):
    if set(allocations) != set(state["suppliers"]):
        raise ValueError("Allocations must include exactly all known suppliers.")
    if abs(sum(allocations.values()) - 1.0) > 0.0001:
        raise ValueError("Supplier allocations must sum to 1.00.")

    max_shift = state["constraints"]["max_auto_supplier_shift"]
    before = {
        supplier_id: supplier["current_allocation"]
        for supplier_id, supplier in state["suppliers"].items()
    }

    for supplier_id, new_allocation in allocations.items():
        supplier = state["suppliers"][supplier_id]
        if new_allocation < supplier["contract_minimum"]:
            raise ValueError(
                f"Allocation for {supplier_id} violates contract_minimum of {supplier['contract_minimum']}."
            )
        shift = abs(new_allocation - supplier["current_allocation"])
        if shift > max_shift + 0.0001:
            raise ValueError(
                f"Allocation shift for {supplier_id} exceeds max_auto_supplier_shift of {max_shift}."
            )

    for supplier_id, new_allocation in allocations.items():
        state["suppliers"][supplier_id]["current_allocation"] = new_allocation

    after = {
        supplier_id: supplier["current_allocation"]
        for supplier_id, supplier in state["suppliers"].items()
    }
    return log_action(
        state,
        "update_supplier_allocation",
        {"allocations": allocations},
        before,
        after,
    )


def update_reorder_point(state, warehouse_id, product_id, new_reorder_point):
    _require_warehouse(state, warehouse_id)
    _require_product(state, product_id)
    if new_reorder_point < 0:
        raise ValueError("Reorder point cannot be negative.")

    warehouse = state["warehouses"][warehouse_id]
    before = deepcopy(warehouse["reorder_point"])
    warehouse["reorder_point"][product_id] = new_reorder_point
    after = deepcopy(warehouse["reorder_point"])

    return log_action(
        state,
        "update_reorder_point",
        {
            "warehouse_id": warehouse_id,
            "product_id": product_id,
            "new_reorder_point": new_reorder_point,
        },
        before,
        after,
    )


def update_lane_status(state, lane_id, status=None, transit_days=None, capacity=None):
    if lane_id not in state["lanes"]:
        raise ValueError(f"Unknown lane: {lane_id}")
    if transit_days is not None and transit_days <= 0:
        raise ValueError("transit_days must be positive.")
    if capacity is not None and capacity < 0:
        raise ValueError("capacity cannot be negative.")

    lane = state["lanes"][lane_id]
    before = deepcopy(lane)
    if status is not None:
        lane["status"] = status
    if transit_days is not None:
        lane["transit_days"] = transit_days
    if capacity is not None:
        lane["capacity"] = capacity
    after = deepcopy(lane)

    return log_action(
        state,
        "update_lane_status",
        {
            "lane_id": lane_id,
            "status": status,
            "transit_days": transit_days,
            "capacity": capacity,
        },
        before,
        after,
    )

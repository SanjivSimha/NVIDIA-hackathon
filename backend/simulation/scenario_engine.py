from copy import deepcopy

from simulation.action_engine import (
    transfer_inventory,
    update_reorder_point,
    update_supplier_allocation,
)
from simulation.kpi_engine import calculate_kpis


def calculate_delta(before_kpis, after_kpis):
    delta = {}
    for key, before_value in before_kpis.items():
        after_value = after_kpis[key]
        if isinstance(before_value, dict):
            delta[key] = {
                nested_key: round(after_value[nested_key] - nested_value, 4)
                for nested_key, nested_value in before_value.items()
            }
        elif isinstance(before_value, (int, float)):
            delta[key] = round(after_value - before_value, 4)
    return delta


def _simulate(state, action_callback):
    preview_state = deepcopy(state)
    before_kpis = calculate_kpis(preview_state)
    try:
        action_callback(preview_state)
        # Simulation is a preview; keep the state consequences but not audit logs.
        preview_state["action_history"] = deepcopy(state["action_history"])
        after_kpis = calculate_kpis(preview_state)
        return {
            "valid": True,
            "message": "Simulation completed. Real state was not changed.",
            "before_kpis": before_kpis,
            "after_kpis": after_kpis,
            "delta": calculate_delta(before_kpis, after_kpis),
            "preview_state": preview_state,
        }
    except ValueError as error:
        return {
            "valid": False,
            "message": str(error),
            "before_kpis": before_kpis,
            "after_kpis": None,
            "delta": None,
        }


def simulate_transfer_inventory(state, product_id, from_warehouse, to_warehouse, units):
    return _simulate(
        state,
        lambda preview_state: transfer_inventory(
            preview_state, product_id, from_warehouse, to_warehouse, units
        ),
    )


def simulate_supplier_allocation(state, allocations):
    return _simulate(
        state,
        lambda preview_state: update_supplier_allocation(preview_state, allocations),
    )


def simulate_reorder_point(state, warehouse_id, product_id, new_reorder_point):
    return _simulate(
        state,
        lambda preview_state: update_reorder_point(
            preview_state, warehouse_id, product_id, new_reorder_point
        ),
    )

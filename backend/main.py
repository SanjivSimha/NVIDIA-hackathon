from fastapi import FastAPI, HTTPException

from simulation.action_engine import (
    transfer_inventory,
    update_lane_status,
    update_reorder_point,
    update_supplier_allocation,
)
from simulation.event_engine import apply_tick
from simulation.kpi_engine import calculate_kpis
from simulation.scenario_engine import (
    simulate_reorder_point,
    simulate_supplier_allocation,
    simulate_transfer_inventory,
)
from simulation.schemas import (
    LaneUpdateRequest,
    ReorderPointRequest,
    SupplierAllocationRequest,
    TransferInventoryRequest,
)
from simulation.state import get_world_state, reset_world_state


app = FastAPI(title="ChainPilot Simulation Backend")


def _execute_action(action_callback):
    state = get_world_state()
    try:
        log_entry = action_callback(state)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return {
        "success": True,
        "message": "Action executed and logged.",
        "log_entry": log_entry,
        "new_kpis": calculate_kpis(state),
        "updated_state": state,
    }


@app.get("/")
def root():
    return {
        "service": "ChainPilot Simulation Backend",
        "status": "ok",
    }


@app.get("/state")
def state():
    return get_world_state()


@app.get("/kpis")
def kpis():
    return calculate_kpis(get_world_state())


@app.get("/graph")
def graph():
    state = get_world_state()
    return {
        "graph": state["graph"],
        "lanes": state["lanes"],
    }


@app.get("/actions/history")
def action_history():
    return get_world_state()["action_history"]


@app.get("/events/history")
def event_history():
    return get_world_state()["event_history"]


@app.post("/simulate/transfer-inventory")
def simulate_transfer_inventory_endpoint(request: TransferInventoryRequest):
    return simulate_transfer_inventory(
        get_world_state(),
        request.product_id,
        request.from_warehouse,
        request.to_warehouse,
        request.units,
    )


@app.post("/execute/transfer-inventory")
def execute_transfer_inventory(request: TransferInventoryRequest):
    return _execute_action(
        lambda state: transfer_inventory(
            state,
            request.product_id,
            request.from_warehouse,
            request.to_warehouse,
            request.units,
        )
    )


@app.post("/simulate/update-supplier-allocation")
def simulate_update_supplier_allocation(request: SupplierAllocationRequest):
    return simulate_supplier_allocation(get_world_state(), request.allocations)


@app.post("/execute/update-supplier-allocation")
def execute_update_supplier_allocation(request: SupplierAllocationRequest):
    return _execute_action(
        lambda state: update_supplier_allocation(state, request.allocations)
    )


@app.post("/simulate/update-reorder-point")
def simulate_update_reorder_point(request: ReorderPointRequest):
    return simulate_reorder_point(
        get_world_state(),
        request.warehouse_id,
        request.product_id,
        request.new_reorder_point,
    )


@app.post("/execute/update-reorder-point")
def execute_update_reorder_point(request: ReorderPointRequest):
    return _execute_action(
        lambda state: update_reorder_point(
            state,
            request.warehouse_id,
            request.product_id,
            request.new_reorder_point,
        )
    )


@app.post("/execute/update-lane")
def execute_update_lane(request: LaneUpdateRequest):
    return _execute_action(
        lambda state: update_lane_status(
            state,
            request.lane_id,
            request.status,
            request.transit_days,
            request.capacity,
        )
    )


@app.post("/tick")
def tick():
    state = get_world_state()
    tick_result = apply_tick(state)
    return {
        **tick_result,
        "new_kpis": calculate_kpis(state),
    }


@app.post("/reset")
def reset():
    state = reset_world_state()
    return {
        "success": True,
        "message": "World state reset to initial state.",
        "state": state,
        "kpis": calculate_kpis(state),
    }

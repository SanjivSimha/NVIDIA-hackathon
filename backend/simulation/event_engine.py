from datetime import datetime, timezone


SCRIPTED_EVENTS = {
    1: {
        "type": "demand_increase",
        "description": "east_region forecast demand for clif_bar increased from 1800 to 2200.",
    },
    2: {
        "type": "lane_delay",
        "description": "west_to_east_truck transit_days increased from 4 to 6.",
    },
    3: {
        "type": "supplier_delay",
        "description": "supplier_a lead_time_days increased from 12 to 15.",
    },
    4: {
        "type": "air_cost_increase",
        "description": "west_to_east_air cost_per_unit increased from 2.50 to 3.20.",
    },
}


def _timestamp():
    return datetime.now(timezone.utc).isoformat()


def apply_tick(state):
    state["time_step"] += 1
    time_step = state["time_step"]
    event = SCRIPTED_EVENTS.get(
        time_step,
        {
            "type": "no_scripted_event",
            "description": "No scripted event for this tick.",
        },
    )

    if time_step == 1:
        state["demand_regions"]["east_region"]["forecast_demand"]["clif_bar"] = 2200
    elif time_step == 2:
        state["lanes"]["west_to_east_truck"]["transit_days"] = 6
    elif time_step == 3:
        state["suppliers"]["supplier_a"]["lead_time_days"] = 15
    elif time_step == 4:
        state["lanes"]["west_to_east_air"]["cost_per_unit"] = 3.20

    log_entry = {
        "timestamp": _timestamp(),
        "time_step": time_step,
        "event": event,
    }
    state["event_history"].append(log_entry)
    return {
        "time_step": time_step,
        "event": event,
        "state": state,
    }

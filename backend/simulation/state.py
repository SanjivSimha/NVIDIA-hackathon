from copy import deepcopy


INITIAL_WORLD_STATE = {
    "time_step": 0,
    "products": {
        "clif_bar": {
            "name": "Clif Bar",
            "unit_type": "case",
            "margin": 12.50,
            "stockout_cost": 25.00,
            "priority": "medium",
        }
    },
    "suppliers": {
        "supplier_a": {
            "cost_per_unit": 8.20,
            "lead_time_days": 12,
            "capacity_per_month": 8000,
            "current_allocation": 0.80,
            "contract_minimum": 0.60,
            "reliability": 0.94,
            "approved_products": ["clif_bar"],
        },
        "supplier_b": {
            "cost_per_unit": 7.90,
            "lead_time_days": 10,
            "capacity_per_month": 5000,
            "current_allocation": 0.20,
            "contract_minimum": 0.00,
            "reliability": 0.90,
            "approved_products": ["clif_bar"],
        },
    },
    "warehouses": {
        "west_dc": {
            "inventory": {"clif_bar": 5000},
            "capacity": 7000,
            "daily_throughput": 1200,
            "safety_stock": {"clif_bar": 1000},
            "reorder_point": {"clif_bar": 1500},
            "service_regions": ["west_region"],
        },
        "east_dc": {
            "inventory": {"clif_bar": 600},
            "capacity": 5000,
            "daily_throughput": 900,
            "safety_stock": {"clif_bar": 900},
            "reorder_point": {"clif_bar": 1300},
            "service_regions": ["east_region"],
        },
    },
    "demand_regions": {
        "west_region": {
            "forecast_demand": {"clif_bar": 1500},
            "priority": "medium",
            "service_level_target": 0.95,
            "max_delay_days": 5,
        },
        "east_region": {
            "forecast_demand": {"clif_bar": 1800},
            "priority": "high",
            "service_level_target": 0.97,
            "max_delay_days": 3,
        },
    },
    "lanes": {
        "west_to_east_truck": {
            "origin": "west_dc",
            "destination": "east_dc",
            "mode": "truck",
            "cost_per_unit": 0.80,
            "transit_days": 4,
            "capacity": 3000,
            "emissions_per_unit": 0.40,
            "reliability": 0.91,
            "status": "active",
        },
        "west_to_east_air": {
            "origin": "west_dc",
            "destination": "east_dc",
            "mode": "air",
            "cost_per_unit": 2.50,
            "transit_days": 1,
            "capacity": 1000,
            "emissions_per_unit": 0.90,
            "reliability": 0.96,
            "status": "active",
        },
    },
    "constraints": {
        "max_auto_supplier_shift": 0.20,
        "max_auto_transfer_units": 1500,
        "max_air_freight_percent": 0.35,
    },
    "graph": {
        "supplier_a": ["west_dc"],
        "supplier_b": ["west_dc"],
        "west_dc": ["west_region", "east_dc"],
        "east_dc": ["east_region"],
    },
    "action_history": [],
    "event_history": [],
}


WORLD_STATE = deepcopy(INITIAL_WORLD_STATE)


def get_world_state():
    return WORLD_STATE


def reset_world_state():
    global WORLD_STATE
    WORLD_STATE = deepcopy(INITIAL_WORLD_STATE)
    return WORLD_STATE

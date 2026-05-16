def _region_inventory(state, region_id, product_id):
    for warehouse in state["warehouses"].values():
        if region_id in warehouse["service_regions"]:
            return warehouse["inventory"].get(product_id, 0)
    return 0


def _region_warehouse_id(state, region_id):
    for warehouse_id, warehouse in state["warehouses"].items():
        if region_id in warehouse["service_regions"]:
            return warehouse_id
    return None


def calculate_kpis(state):
    product_id = "clif_bar"
    total_demand = sum(
        region["forecast_demand"].get(product_id, 0)
        for region in state["demand_regions"].values()
    )

    stockout_risk = {}
    for region_id, region in state["demand_regions"].items():
        demand = region["forecast_demand"].get(product_id, 0)
        inventory = _region_inventory(state, region_id, product_id)
        stockout_risk[region_id] = 0 if demand <= 0 else max(0, demand - inventory) / demand

    excess_inventory = {}
    for warehouse_id, warehouse in state["warehouses"].items():
        served_demand = 0
        for region_id in warehouse["service_regions"]:
            served_demand += state["demand_regions"][region_id]["forecast_demand"].get(product_id, 0)
        inventory = warehouse["inventory"].get(product_id, 0)
        excess_inventory[warehouse_id] = max(0, inventory - served_demand)

    supplier_cost = 0
    supplier_allocation = {}
    for supplier_id, supplier in state["suppliers"].items():
        allocation = supplier["current_allocation"]
        supplier_allocation[supplier_id] = allocation
        supplier_cost += total_demand * allocation * supplier["cost_per_unit"]

    truck_volume = 700
    air_volume = 300
    truck_lane = state["lanes"]["west_to_east_truck"]
    air_lane = state["lanes"]["west_to_east_air"]
    transport_cost = (
        truck_volume * truck_lane["cost_per_unit"]
        + air_volume * air_lane["cost_per_unit"]
    )
    estimated_emissions = (
        truck_volume * truck_lane["emissions_per_unit"]
        + air_volume * air_lane["emissions_per_unit"]
    )

    inventory = {
        warehouse_id: warehouse["inventory"].get(product_id, 0)
        for warehouse_id, warehouse in state["warehouses"].items()
    }

    return {
        "estimated_total_cost": round(supplier_cost + transport_cost, 2),
        "stockout_risk": {key: round(value, 4) for key, value in stockout_risk.items()},
        "excess_inventory": excess_inventory,
        "estimated_emissions": round(estimated_emissions, 2),
        "supplier_allocation": supplier_allocation,
        "inventory": inventory,
    }

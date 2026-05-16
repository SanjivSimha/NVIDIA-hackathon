# ChainPilot Simulation Backend

ChainPilot Simulation Backend is a FastAPI supply-chain world model and consequence engine for autonomous agent experiments. It exposes current state, graph structure, KPI calculations, scenario simulation, action execution, scripted events, and audit logs.

This service intentionally does not optimize decisions. There is no `/optimize`, `/best-action`, or equivalent endpoint. Red, Blue, and Work agents should reason over the API outputs and propose actions themselves.

## Install

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload
```

Open the interactive FastAPI docs at:

```text
http://127.0.0.1:8000/docs
```

## API Contract

- `GET /` returns service name and health status.
- `GET /state` returns the mutable world state.
- `GET /kpis` returns current KPI calculations.
- `GET /graph` returns the directed supply-chain graph and lanes.
- `GET /actions/history` returns executed action audit logs.
- `GET /events/history` returns scripted event logs.
- `POST /simulate/transfer-inventory` previews an inventory transfer.
- `POST /execute/transfer-inventory` executes and logs an inventory transfer.
- `POST /simulate/update-supplier-allocation` previews supplier allocation changes.
- `POST /execute/update-supplier-allocation` executes and logs supplier allocation changes.
- `POST /simulate/update-reorder-point` previews reorder point changes.
- `POST /execute/update-reorder-point` executes and logs reorder point changes.
- `POST /execute/update-lane` executes and logs lane status, transit day, or capacity changes.
- `POST /tick` advances simulation time and applies scripted events.
- `POST /reset` resets the world to the initial state.

`/simulate` endpoints do not mutate the real world state. They return `before_kpis`, `after_kpis`, `delta`, and a `preview_state`.

`/execute` endpoints mutate the real world state. Every executed action logs `timestamp`, `time_step`, `action_type`, `payload`, `before`, and `after`.

## Example Requests

Get current state:

```bash
curl http://127.0.0.1:8000/state
```

Get current KPIs:

```bash
curl http://127.0.0.1:8000/kpis
```

Preview a transfer without changing real state:

```bash
curl -X POST http://127.0.0.1:8000/simulate/transfer-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "clif_bar",
    "from_warehouse": "west_dc",
    "to_warehouse": "east_dc",
    "units": 900
  }'
```

Execute the same transfer:

```bash
curl -X POST http://127.0.0.1:8000/execute/transfer-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "clif_bar",
    "from_warehouse": "west_dc",
    "to_warehouse": "east_dc",
    "units": 900
  }'
```

Confirm KPIs changed:

```bash
curl http://127.0.0.1:8000/kpis
```

Confirm audit logging:

```bash
curl http://127.0.0.1:8000/actions/history
```

Advance the scripted simulation:

```bash
curl -X POST http://127.0.0.1:8000/tick
```

Reset state:

```bash
curl -X POST http://127.0.0.1:8000/reset
```

## Suggested Agent Flow

Red, Blue, and Work agents should treat this backend as an agent-consumable tool API:

1. Read `GET /state`, `GET /graph`, and `GET /kpis`.
2. Generate candidate actions using their own reasoning.
3. Call `/simulate/...` endpoints to preview consequences.
4. Compare returned KPI deltas and constraints outside this backend.
5. Submit approved actions to `/execute/...`.
6. Read `/actions/history` and `/events/history` for audit context.
7. Use `POST /tick` to advance scripted scenario pressure.

The backend calculates consequences and logs outcomes; it does not choose the best action.

## Example Test Flow

1. `GET /state`
2. `GET /kpis`
3. `POST /simulate/transfer-inventory` with:

```json
{
  "product_id": "clif_bar",
  "from_warehouse": "west_dc",
  "to_warehouse": "east_dc",
  "units": 900
}
```

4. `POST /execute/transfer-inventory` with the same body.
5. `GET /kpis` to confirm `east_region` stockout risk decreased.
6. `GET /actions/history` to confirm the audit log.

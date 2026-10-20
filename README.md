# Arjuna Rover AI — Safe Navigation Lab

A small, interactive browser prototype for exploring explainable, risk-aware navigation for a hypothetical indoor rover. It runs locally in a browser and has no hardware, camera, network service, or AI model attached.

## What it does

- Plans a route across a 12 × 10 tile map with Dijkstra's algorithm.
- Treats marked risk zones as traversable but assigns each one an adjustable cost. High risk aversion may choose a longer path to avoid them.
- Lets you add/remove walls, generate a random map, pause, step through a mission, and reset.
- Safe-stops and replans when the map changes while the rover is moving.
- Displays route length, risk-zone count, an illustrative battery estimate, and a plain-language route explanation.

The planner is deterministic pathfinding, not a trained machine-learning model. Risk zones are hand-authored simulation data, not sensor readings. This is an educational software demo, not a claim of a new physical invention or a safety-certified autonomous system.

## Run it

No install or build step is needed. Open `index.html` in a current desktop or mobile browser. The Google Fonts import is optional; the app still works offline with system fonts. You can also serve the folder with any static file server.

## Run tests

Requires Node.js 18 or later; no third-party packages are needed:

```sh
node tests/planner.test.js
```

## Project structure

- `index.html` — app structure and controls
- `style.css` — responsive interface
- `planner.js` — standalone route-planning module (also usable from Node)
- `app.js` — map rendering and mission controls
- `tests/planner.test.js` — route-planning checks

## Safety and hardware roadmap

This browser demo controls no robot. Do not copy its planner directly into a physical system or rely on it for people, pets, stairs, traffic, or hazardous environments. A real robot needs independent hardware emergency stop, validated sensors, actuator limits, watchdogs, fault handling, and supervised testing.

A responsible next prototype could proceed in stages:

1. Agree on a low-speed, tabletop or enclosed test environment and a budget.
2. Select a small two-wheel chassis, a microcontroller, motor driver, and distance sensors; verify voltage/current compatibility from manufacturer datasheets.
3. Keep a physical power cutoff independent of software; begin with motors disabled and test sensor readings.
4. Add a microcontroller interface with bounded commands and a stale-command timeout; never expose unrestricted browser control.
5. Test at low speed in an empty enclosure, then add obstacles and documented failure tests under supervision.
6. Only after the behavior is measured and reviewed should you consider mapping, camera perception, or a learned model.

Potential follow-on innovations to investigate (not implemented or validated here): sensor uncertainty maps, explainable risk budgets, low-cost multi-sensor fusion, and a privacy-preserving local mapper. Validate novelty and feasibility before presenting any of these as inventions.

## License

No license has been selected. Add an explicit license before inviting reuse or accepting contributions.

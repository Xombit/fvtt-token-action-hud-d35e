# Token Action HUD D35E

Token Action HUD D35E is a Token Action HUD Core companion module for the current `D35E` system on Foundry VTT v14.

## Status

The module is currently in an early public release phase. The goal is to provide a stable Token Action HUD Core integration for D35E without duplicating D35E rules logic inside the HUD layer.

## Requirements

- Foundry Virtual Tabletop v13.351 through v14.360
- D35E v3.0.1 or newer
- Token Action HUD Core v2.0.11 or newer
- socketlib

## Installation

Install from Foundry's module browser when the package is listed, or install manually using the manifest URL:

`https://github.com/Xombit/fvtt-token-action-hud-d35e/releases/latest/download/module.json`

## Current Coverage

- Registers as a Token Action HUD Core system module for D35E
- Provides D35E-specific action, roll, defaults, and settings handlers
- Uses current D35E runtime methods as the authoritative execution path

## Project Approach

- Token Action HUD Classic is used only as a parity reference
- Pathfinder 1e is used as a structural reference where D35E still follows PF1-derived patterns
- Current D35E runtime behavior is authoritative for action routing

The discovery notes used to shape the initial taxonomy are kept in `docs/discovery-matrix.md`.

## Known Limits

- This is an early release and action coverage is still expanding
- Full public packaging and release automation are present, but the first public package may still surface rough edges in less common D35E workflows

## Support

Report bugs and compatibility issues at:

`https://github.com/Xombit/fvtt-token-action-hud-d35e/issues`

## License

This project is released under the MIT License. Foundry module development remains subject to the Foundry Virtual Tabletop license and EULA.
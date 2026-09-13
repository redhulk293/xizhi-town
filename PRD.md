You are working on an original multiplayer economic strategy board game.

Before writing code, read:

`/docs/PRD.md`

Treat the PRD as the current product specification.

Do NOT attempt to build the entire game yet.

## Current task

Implement **Phase 1: the deterministic game engine** only.

The goal is to create a headless, fully testable game simulation that contains the core rules independently from the UI and multiplayer layer.

### Implement

* Game state
* Players
* Lots
* Districts
* Business types
* Business ownership
* Cash
* Land acquisition
* Business distribution
* Business completion
* Business income
* Basic market modifiers
* Years
* Game phases
* Player-to-player asset trading
* Installment contracts
* Installment payments
* Interest calculation
* Outstanding obligations
* Basic loans/debt
* Final net-worth calculation

## Important architecture rules

The game engine must NOT depend on:

* React
* Browser APIs
* WebSockets
* UI components
* Database-specific code
* Authentication
* External APIs

It should be possible to run the entire game as a deterministic local simulation.

Separate:

1. Domain models
2. Game rules
3. Commands/actions
4. State transitions
5. Financial calculations
6. Validation
7. Tests

All authoritative calculations must happen inside the game engine.

Do not hardcode game balance values throughout the code.

Put configurable values into a central configuration/ruleset structure.

## Installment system

Implement installments as a first-class game mechanic.

Support:

* Full cash purchase
* Interest-free installment
* Interest-bearing installment
* Down payment
* Fixed payment schedule
* Payment due dates/years
* Remaining principal
* Interest
* Early repayment
* Default detection
* Collateral reference

The exact rules should follow `/docs/PRD.md`.

Financial calculations must use integer minor currency units rather than floating-point arithmetic.

## Testing

Create comprehensive unit tests for:

* Land ownership
* Business completion
* Business income
* Adjacency bonuses
* Trades
* Invalid trades
* Installment creation
* Interest calculation
* Payment schedules
* Early repayment
* Default
* Debt
* Final net worth
* Phase validation

Also create a small deterministic simulation that can run multiple games without a UI.

## Do NOT implement yet

Do not build:

* React UI
* Map graphics
* Chat
* WebSockets
* Matchmaking
* Authentication
* Animations
* Sound
* AI opponents
* Cosmetics

## Development approach

First inspect the existing repository and determine its current structure.

Do not unnecessarily replace existing infrastructure.

Before making large architectural changes, explain the proposed structure.

Implement the smallest clean version that satisfies the PRD.

After implementation:

1. Run all tests.
2. Fix failures.
3. Run the deterministic simulation.
4. Report the architecture created.
5. Report what was implemented.
6. Report any PRD requirements that remain intentionally unimplemented.

Do not silently invent major game rules when the PRD is ambiguous. Put configurable assumptions in one place and document them.

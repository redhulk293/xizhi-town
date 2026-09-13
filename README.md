# Xizhi Town

Xizhi Town is an online multiplayer negotiation board game for 3–8 players.

The game is intentionally focused.

It is NOT an economic simulator, city builder, management game, idle game, or complex financial simulator.

---

# Design Constitution

## The Four Pillars

Everything in Xizhi Town revolves around:

1. **Land**
2. **Business Tiles**
3. **Money**
4. **Deals**

The core loop is:

**Receive → Inspect → Negotiate → Trade → Build → Earn → Repeat**

If a proposed feature does not strengthen one of these four pillars, it should probably not exist in V1.

---

# HARD RULE: DO NOT INVENT FEATURES

This project intentionally has a narrow scope.

When implementing or modifying the game:

**Do not add features that are not specified.**

Do not assume that "more features = better game."

Do not add mechanics because:

* another game has them
* they are common in multiplayer games
* they make the UI look more complete
* they make the database more sophisticated
* they make the economy appear deeper
* they are easy to implement
* an AI believes players "might like them"

If something is not specified:

### DO NOT IMPLEMENT IT.

Instead:

1. Leave the game unchanged.
2. Add the idea to `FUTURE_IDEAS.md`.
3. Continue with the existing specification.

---

# Explicitly Out of Scope for V1

The following must NOT be implemented unless the project owner explicitly changes the specification:

* AI opponents
* Bots
* Business upgrades
* Bank loans
* Investment systems
* Stock markets
* Economic events
* Random economic modifiers
* City-building systems
* Research trees
* Technology trees
* XP systems
* Character progression
* Quests
* Daily rewards
* Battle passes
* Guilds
* Crafting
* Inventory systems
* NPC economies
* Complex auctions
* Complex bankruptcy
* Player elimination
* Complex collateral
* Credit scores
* District progression systems
* Idle income systems
* Incremental mechanics

---

# Important Principle

## The players ARE the economy.

Xizhi Town does not need random economic events to create interesting situations.

Interesting situations should come from:

* Random tile distribution
* Limited business supply
* Land positioning
* Business completion
* Player ownership
* Scarcity
* Negotiation
* Trading
* Player-to-player financing

Do not add random events to artificially create volatility.

---

# Business Philosophy

Businesses are simple.

A business has:

* A name
* A number of required tiles
* A limited total supply
* Incomplete income
* Complete income
* Geographic requirements where applicable

Businesses do not have:

* Upgrade levels
* Experience
* Skill trees
* Research
* Premium versions
* Building progression

The interesting question is:

> "Can I complete this business?"

Not:

> "How do I level this business?"

---

# Business Scarcity

Business tiles are intentionally scarce.

A business may require:

```text
4 tiles
```

while only:

```text
6 tiles
```

exist in the entire game.

This creates player-driven scarcity.

Do not remove scarcity by generating unlimited copies.

Do not make every business easily completable.

---

# Land Philosophy

Land has no mandatory fixed purchase price.

Land value is contextual.

A lot may be:

* Low value to one player
* High value to another
* Extremely valuable to someone who needs it to complete a business

Do not turn the game into a property-buying game.

The interesting question is:

> "Who needs this land?"

---

# Negotiation Philosophy

Negotiation is the primary gameplay mechanic.

Players should be able to:

* Call each other
* Negotiate verbally
* Make structured proposals
* Counter proposals
* Trade land
* Trade business tiles
* Trade cash
* Combine multiple assets
* Negotiate deferred payments

The game should not automate negotiation away.

---

# Voice Communication

Voice exists to support negotiation.

Voice does NOT execute game actions.

A player can say:

> "I'll give you Lot A17 and $50k."

But the transaction must still be created through the game's proposal system.

The server validates the actual transaction.

---

# Deferred Payment

Deferred player-to-player payment is an intentional V1 mechanic.

It exists because it creates interesting negotiation.

Example:

```text
$100k now
+
$200k next round
```

The game should keep this system simple.

Do not transform it into a banking simulator.

---

# Multiplayer Philosophy

Supabase provides persistence and realtime synchronization.

It is infrastructure.

It is not the game rules.

The authoritative game logic must validate:

* Ownership
* Cash
* Trades
* Payments
* Game phase
* Randomness
* Contracts
* Final state

Never trust the client.

---

# Source of Truth

Game rules should live in the domain/game-engine layer.

Not in:

* React components
* CSS
* Client-only state
* UI event handlers
* Browser-local calculations

The UI displays state.

The game engine determines state.

---

# Data-Driven Configuration

These should be configurable data:

* Businesses
* Business tile supply
* Income
* Map layouts
* District layouts
* Lot definitions
* Round count
* Distribution rules
* Player count
* Game configuration

Do not hardcode these into visual components.

---

# Randomness

Authoritative randomness belongs to the server/game engine.

Use deterministic seeds.

A game should be reproducible from its seed and command history as much as reasonably possible.

Never trust client-generated random numbers for game state.

---

# Financial Integrity

Money must use integer minor currency units.

Do not use floating-point arithmetic for authoritative financial calculations.

Transactions must be atomic.

A trade must either:

**fully succeed**

or:

**fully fail.**

Never partially apply a transaction.

---

# UI Philosophy

Xizhi Town is a board game.

It is not a SaaS dashboard.

Prefer:

* Map-first UI
* Clear information
* Small contextual panels
* Simple controls
* Strong visual hierarchy
* Calm visual design
* Minimal noise

Avoid:

* Dashboard layouts
* Huge card collections
* Excessive charts
* Excessive metrics
* Unnecessary tables
* Excessive popups
* Neon gaming UI
* Excessive gradients
* Overly dark UI
* Fake gamification

---

# Map Philosophy

The map is the heart of the game.

Districts must genuinely differ.

Do not generate eight identical grids and recolor them.

Geometry should matter.

Examples:

* Irregular blocks
* Narrow streets
* Large blocks
* Corners
* Waterfront
* Plazas
* Alleys
* Intersections

Map geometry must remain compatible with the business rules.

---

# Future Features

If an idea appears during development, DO NOT immediately implement it.

Create or update:

`FUTURE_IDEAS.md`

Example:

```md
# Future Ideas

## Bank Loans
Possible future mechanic.
Not part of V1.

## Auctions
Possible future mechanic.
Not part of V1.

## AI Opponents
Possible future mechanic.
Not part of V1.
```

A future idea is NOT an approved feature.

Only an explicit project specification update can promote it into the game.

---

# Change Control

Before implementing a new gameplay feature, ask:

### 1. Is it explicitly specified?

If no → do not implement.

### 2. Does it strengthen Land, Business Tiles, Money, or Deals?

If no → do not implement.

### 3. Does it introduce a new gameplay loop?

If yes → do not implement without explicit approval.

### 4. Does it make the game significantly more complicated?

If yes → stop and evaluate before implementing.

### 5. Could the same goal be achieved with an existing mechanic?

If yes → use the existing mechanic.

---

# Anti-Scope-Creep Rule

The following reasoning is NOT acceptable:

> "Players may eventually want..."

> "Most multiplayer games have..."

> "It would be better if..."

> "We could make the economy deeper by..."

> "Let's add a progression system..."

> "Let's add achievements..."

> "Let's add AI..."

> "Let's add events..."

Do not implement speculative features.

---

# Definition of Done

A feature is not complete because:

* A button exists
* A modal opens
* A database row exists
* The UI looks convincing
* A placeholder response appears

A feature is complete only when:

1. The underlying game logic works.
2. Invalid actions are rejected.
3. State is persisted correctly.
4. Multiplayer state synchronizes correctly where applicable.
5. Tests cover important edge cases.
6. The feature works in an actual playable game.

---

# Final Rule

When choosing between:

### More features

and

### Better negotiation

Choose:

**Better negotiation.**

When choosing between:

### More complexity

and

### Better clarity

Choose:

**Better clarity.**

When choosing between:

### A new mechanic

and

### Improving an existing mechanic

Choose:

**Improving the existing mechanic.**

Xizhi Town succeeds when players look at the board and think:

> "I need that."

Then call another player and make a deal.

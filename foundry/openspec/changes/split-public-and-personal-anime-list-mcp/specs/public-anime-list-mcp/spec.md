## Purpose

Provides a frictionless public Anime List catalog connection while keeping
personal watchlists behind a separate explicit OAuth boundary.

## ADDED Requirements

### Requirement: Public Anime catalog is independently queryable
The system SHALL expose an anonymous Anime List connection containing only
public catalog search, detail, statistics, and random-discovery tools.

#### Scenario: Anonymous client initializes public Anime List
- **WHEN** an MCP client initializes the public Anime List route without credentials
- **THEN** it receives the Anime List public identity and exactly the approved public catalog tools

### Requirement: Personal Anime data remains separately authenticated
The public Anime List connection MUST NOT expose watchlists, tags, account
records, or any tool requiring user identity; those capabilities SHALL remain
on the separate OAuth personal Anime List connection.

#### Scenario: Public client requests a watchlist tool
- **WHEN** an anonymous caller attempts to invoke a personal watchlist tool through the public route
- **THEN** the route returns a bounded tool-not-found error without forwarding the request upstream

#### Scenario: Personal client initializes Anime List
- **WHEN** an authenticated user initializes the personal Anime List connection
- **THEN** the existing OAuth route retains its complete approved catalog and user-scoped watchlist tools

### Requirement: Public and personal hosts remain isolated
Each Anime List connection MUST have a distinct branded hostname, server
identity, listing, challenge binding name, and security scheme.

#### Scenario: Route is requested through the wrong Anime hostname
- **WHEN** either Anime List route is requested through the other connection's hostname
- **THEN** the gateway returns a bounded not-found response without invoking Anime List


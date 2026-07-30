## 1. Skill Surface

- [x] 1.1 Initialize the `local-ports-cleanup` skill with canonical UI metadata
- [x] 1.2 Write the evidence-first inspection, cleanup selection, preservation,
  and verification workflow around the installed `ports` CLI

## 2. Fleet Exposure

- [x] 2.1 Add the standalone skill to the canonical agent-stack exposure list
- [x] 2.2 Update Fleet instructions and standards so agents can discover the
  local cleanup surface
- [x] 2.3 Add a focused test for skill metadata, safety boundaries, and managed
  exposure

## 3. Validation

- [x] 3.1 Run the skill validator and focused Fleet test
- [x] 3.2 Install managed local skill links and verify the skill is discoverable
- [x] 3.3 Run strict OpenSpec validation and `git diff --check`
- [x] 3.4 Review the final diff and confirm no process, dependency, production,
  credential, or unrelated-work mutation occurred

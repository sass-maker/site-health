# Fleet attention policy

Project membership and current attention are authored only in
[`../config/projects.json`](../config/projects.json). The generated inventory,
including current counts and membership, is
[`project-catalog.md`](project-catalog.md).

This file defines treatment by attention class without duplicating the project
list:

| Attention | Treatment |
| --- | --- |
| My Work | Human-led product direction; automation provides evidence and guardrails |
| Toolbox | Maintain usability and ambient discoverability; run bounded experiments |
| Foundry + Helpers | Run the verified post-ship measure, market, and feedback loop |
| Past / inactive | No routine work; reactivate explicitly |

## Operating rules

- My Work direction remains owner-led.
- Toolbox projects may receive lightweight build, availability, dependency,
  domain, indexing, directory, and bounded marketing checks. Do not create
  standing feature roadmaps or paid-acquisition work automatically.
- Foundry owns shared measurement, marketing, feedback, and control-plane
  capabilities without turning each helper into another product bet.
- Past projects preserve source and attribution but create no routine
  maintenance obligation.
- A public repository may appear in SaaS Maker's Past projects section only
  when the internal catalog explicitly marks it public. Private repositories
  never enter generated external output.

Edit `projects.json`, then run:

```bash
npm run generate:projects
```

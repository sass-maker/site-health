export function clarityPolicy(projects) {
  return {registry:{schema:'fleet.clarity-registry.v2',projects:projects.map(project=>({id:project.id,name:project.name,hostname:'fixture.example',clarityId:`synthetic-${project.id}`,browserSurfaces:[{kind:'combined',file:'synthetic-layout.tsx'}]}))},
    capabilities:{schema:'fleet.clarity-capabilities.v1',updatedAt:'2026-10-31',capabilities:[{id:'recordings',label:'Recordings',mode:'automatic',defaultState:'desired'}]},
    journeys:{schema:'fleet.clarity-journeys.v1',projects:[]}};
}

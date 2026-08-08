export class EnvironmentAdapter {
  async observe() {
    throw new Error("EnvironmentAdapter.observe must be implemented");
  }

  async execute(_action) {
    throw new Error("EnvironmentAdapter.execute must be implemented");
  }
}

export class WorldProgram {
  ground(_observation, _history) {
    throw new Error("WorldProgram.ground must be implemented");
  }

  predict(_state, _action) {
    throw new Error("WorldProgram.predict must be implemented");
  }

  isGoal(_state, _objective) {
    throw new Error("WorldProgram.isGoal must be implemented");
  }
}


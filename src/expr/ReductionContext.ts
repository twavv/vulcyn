/**
 * The context available to expressions during the reduction-to-SQL process.
 *
 * This is mutable.
 */
export class ReductionContext {
  private $currentParameter: number = 0;
  private $parameters: any[] = [];

  /**
   * True if we should always use qualified column names
   * (i.e. `tablename.columnname` instead of just `columnname`).
   */
  private $qualifyNames: boolean;

  constructor({ qualifyNames = true }: { qualifyNames?: boolean } = {}) {
    this.$qualifyNames = qualifyNames;
  }

  /**
   * Get the index of the next parameter.
   */
  addParameter(value: any) {
    this.$parameters.push(value);
    return (this.$currentParameter += 1);
  }

  parameters() {
    return this.$parameters;
  }

  qualifyNames() {
    return this.$qualifyNames;
  }
}

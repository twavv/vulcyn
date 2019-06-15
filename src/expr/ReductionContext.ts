/**
 * The context available to expressions during the reduction-to-SQL process.
 *
 * This is mutable.
 */
class ReductionContext {
  private $currentParameter: number = 0;
  private $parameters: any[] = [];

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
}
export default ReductionContext;

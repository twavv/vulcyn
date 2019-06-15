export function assignGetters(target: any, source: object) {
  Object.entries(source).forEach(([k, v]) => {
    Object.defineProperty(target, k, {
      get() {
        return v;
      },
    });
  });
}

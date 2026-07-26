describe('babel config for the jest environment', () => {
  test('compiles dynamic imports away so jest never reaches the native ESM loader', async () => {
    const { TurnOrder } = await import('./src/core/turn-order');

    expect(TurnOrder.DEFAULT).toBeDefined();
  });
});

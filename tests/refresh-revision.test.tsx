import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlagsProvider } from '../src/FlagsProvider';
import { useFlagsContext } from '../src/context';
import { createMockClient, createMockManager } from './test-utils';

function RefreshProbe(): JSX.Element {
  const state = useFlagsContext();

  return (
    <div>
      <span data-testid="loading">{String(state.isLoading)}</span>
      <span data-testid="revision">{String(state.revision)}</span>
      <button
        type="button"
        data-testid="refresh"
        onClick={() => void state.refresh().catch(() => undefined)}
      />
    </div>
  );
}

describe('FlagsProvider background refresh', () => {
  it('bumps revision after a successful refresh without setting isLoading', async () => {
    const manager = createMockManager({ 'new-ui': true });
    const client = createMockClient(manager);

    const { getByTestId } = render(
      <FlagsProvider client={client as never} preload>
        <RefreshProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(getByTestId('loading').textContent).toBe('false'));
    expect(getByTestId('revision').textContent).toBe('0');

    let resolveRefresh: () => void = () => undefined;
    manager.refreshRules.mockImplementationOnce(
      () => new Promise<void>((resolve) => (resolveRefresh = resolve))
    );

    act(() => {
      getByTestId('refresh').click();
    });

    // Mounted gated UI must keep rendering while rules re-fetch in the background.
    expect(getByTestId('loading').textContent).toBe('false');

    await act(async () => {
      resolveRefresh();
    });

    await waitFor(() => expect(getByTestId('revision').textContent).toBe('1'));
    expect(getByTestId('loading').textContent).toBe('false');
  });

  it('keeps revision unchanged when a refresh fails', async () => {
    const manager = createMockManager({ 'new-ui': true });
    manager.refreshRules.mockRejectedValue(new Error('offline'));
    const client = createMockClient(manager);

    const { getByTestId } = render(
      <FlagsProvider client={client as never} preload={false}>
        <RefreshProbe />
      </FlagsProvider>
    );

    await act(async () => {
      getByTestId('refresh').click();
    });

    await waitFor(() => expect(manager.refreshRules).toHaveBeenCalled());
    expect(getByTestId('revision').textContent).toBe('0');
  });
});

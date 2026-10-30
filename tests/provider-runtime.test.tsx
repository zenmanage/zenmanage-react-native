import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlagsProvider } from '../src/FlagsProvider';
import { useFlagsContext } from '../src/context';

function RuntimeProbe(): JSX.Element {
  const state = useFlagsContext();

  return (
    <div>
      <span data-testid="ready">{String(state.isReady)}</span>
      <span data-testid="loading">{String(state.isLoading)}</span>
    </div>
  );
}

describe('FlagsProvider runtime client init', () => {
  it('builds an internal client from a mobile token', async () => {
    const { getByTestId } = render(
      <FlagsProvider
        environmentToken="mob_test_mobile_key"
        apiEndpoint="https://api.zenmanage.com"
        cacheTtl={120}
        enableUsageReporting={false}
        preload={false}
      >
        <RuntimeProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(getByTestId('ready').textContent).toBe('true'));
    expect(getByTestId('loading').textContent).toBe('false');
  });

  it('builds an internal client from a client token', async () => {
    const { getByTestId } = render(
      <FlagsProvider environmentToken="cli_test_client_key" preload={false}>
        <RuntimeProbe />
      </FlagsProvider>
    );

    await waitFor(() => expect(getByTestId('ready').textContent).toBe('true'));
    expect(getByTestId('loading').textContent).toBe('false');
  });
});

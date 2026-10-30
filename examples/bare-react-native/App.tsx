import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { Attribute, Context } from '@zenmanage/sdk';
import { FlagsProvider, useVariant } from '@zenmanage/react-native';

const context = new Context('user', 'Bare RN User', 'rn-user-101', [
  new Attribute('country', ['US']),
  new Attribute('plan', ['pro']),
]);

function CheckoutSurface(): JSX.Element {
  const { variant, isLoading } = useVariant('checkout-flow', 'control');

  return (
    <View>
      <Text>{isLoading ? 'Loading checkout...' : `Variant: ${variant}`}</Text>
    </View>
  );
}

export default function App(): JSX.Element {
  return (
    <FlagsProvider
      environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}
      context={context}
      refreshOnForeground
      minForegroundRefreshIntervalMs={15_000}
    >
      <SafeAreaView style={{ flex: 1, padding: 24 }}>
        <CheckoutSurface />
      </SafeAreaView>
    </FlagsProvider>
  );
}

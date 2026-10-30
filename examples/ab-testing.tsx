import React from 'react';
import { Text, View } from 'react-native';
import { FlagsProvider, useVariant } from '@zenmanage/react-native';

function CheckoutExperience(): JSX.Element {
  const { variant, isLoading } = useVariant('checkout-flow', 'control');

  if (isLoading) {
    return <Text>Loading checkout experience...</Text>;
  }

  if (variant === 'one-page') {
    return <Text>One-page checkout experience</Text>;
  }

  return <Text>Control multi-step checkout</Text>;
}

export function ABTestingExample(): JSX.Element {
  return (
    <FlagsProvider environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}>
      <View style={{ padding: 16 }}>
        <CheckoutExperience />
      </View>
    </FlagsProvider>
  );
}

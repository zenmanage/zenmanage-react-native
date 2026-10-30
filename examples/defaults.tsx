import React from 'react';
import { Text, View } from 'react-native';
import { DefaultsCollection } from '@zenmanage/sdk';
import { FlagsProvider, useFlag } from '@zenmanage/react-native';

const defaults = DefaultsCollection.fromObject({
  'new-homepage': true,
  'checkout-flow': 'control',
  'cart-item-limit': 20,
});

function DefaultsPanel(): JSX.Element {
  const { value: homepageEnabled } = useFlag('new-homepage', false);
  const { value: cartLimit } = useFlag('cart-item-limit', 10);

  return (
    <View>
      <Text>New homepage: {String(homepageEnabled)}</Text>
      <Text>Cart item limit: {cartLimit}</Text>
    </View>
  );
}

export function DefaultsExample(): JSX.Element {
  return (
    <FlagsProvider
      environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}
      defaults={defaults}
    >
      <View style={{ padding: 16 }}>
        <DefaultsPanel />
      </View>
    </FlagsProvider>
  );
}

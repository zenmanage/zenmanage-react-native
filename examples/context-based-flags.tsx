import React from 'react';
import { Text, View } from 'react-native';
import { Attribute, Context } from '@zenmanage/sdk';
import { FlagsProvider, useFlag } from '@zenmanage/react-native';

const userContext = new Context('user', 'Jane Doe', 'user-123', [
  new Attribute('country', ['US']),
  new Attribute('plan', ['pro']),
]);

function ContextAwareFeature(): JSX.Element {
  const { value: showAdvancedAnalytics } = useFlag('advanced-analytics', false);

  return <Text>{showAdvancedAnalytics ? 'Advanced analytics enabled' : 'Standard analytics'}</Text>;
}

export function ContextBasedFlagsExample(): JSX.Element {
  return (
    <FlagsProvider
      environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}
      context={userContext}
    >
      <View style={{ padding: 16 }}>
        <ContextAwareFeature />
      </View>
    </FlagsProvider>
  );
}

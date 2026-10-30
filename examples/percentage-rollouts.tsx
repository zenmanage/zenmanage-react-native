import React from 'react';
import { Text, View } from 'react-native';
import { Context } from '@zenmanage/sdk';
import { FlagsProvider, useFlag } from '@zenmanage/react-native';

const userContext = Context.single('user', 'user-987');

function RolloutPanel(): JSX.Element {
  const { value } = useFlag('new-checkout-rollout', false);

  return <Text>{value ? 'User is in rollout bucket' : 'User is in control bucket'}</Text>;
}

export function PercentageRolloutsExample(): JSX.Element {
  return (
    <FlagsProvider
      environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}
      context={userContext}
    >
      <View style={{ padding: 16 }}>
        <RolloutPanel />
      </View>
    </FlagsProvider>
  );
}

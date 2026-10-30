import React from 'react';
import { Text, View } from 'react-native';
import { FlagsProvider, useFlag } from '@zenmanage/react-native';

function SimpleFlagsPanel(): JSX.Element {
  const { value: newNavEnabled, isLoading } = useFlag('new-navigation', false);

  if (isLoading) {
    return <Text>Loading flags...</Text>;
  }

  return <Text>{newNavEnabled ? 'New navigation enabled' : 'Using classic navigation'}</Text>;
}

export function SimpleFlagsExample(): JSX.Element {
  return (
    <FlagsProvider environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}>
      <View style={{ padding: 16 }}>
        <SimpleFlagsPanel />
      </View>
    </FlagsProvider>
  );
}

import React from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageCache, FlagsProvider, useFlag } from '@zenmanage/react-native';

const cache = new AsyncStorageCache({
  storage: AsyncStorage,
  keyPrefix: 'zenmanage-mobile',
});

function CachedFeature(): JSX.Element {
  const { value } = useFlag('cached-feature', false);
  return <Text>{value ? 'Cached feature enabled' : 'Cached feature disabled'}</Text>;
}

export function CachingExample(): JSX.Element {
  return (
    <FlagsProvider
      environmentToken={process.env.ZENMANAGE_ENVIRONMENT_TOKEN || 'mob_placeholder'}
      cache={cache}
      cacheTtl={300}
      enableUsageReporting={true}
      refreshOnForeground={true}
    >
      <View style={{ padding: 16 }}>
        <CachedFeature />
      </View>
    </FlagsProvider>
  );
}

import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { Context } from '@zenmanage/sdk';
import { FlagsProvider, useFlag, useIdentify } from '@zenmanage/react-native';

function HomeScreen(): JSX.Element {
  const { value: newNav, isLoading } = useFlag('new-navigation', false);
  const { identify, clearIdentity } = useIdentify();

  return (
    <View style={{ gap: 12 }}>
      <Text>{isLoading ? 'Loading...' : newNav ? 'New navigation ON' : 'Classic navigation'}</Text>
      <Text
        accessibilityRole="button"
        onPress={() => {
          void identify(Context.single('user', 'expo-user-123'));
        }}
      >
        Identify User
      </Text>
      <Text
        accessibilityRole="button"
        onPress={() => {
          void clearIdentity();
        }}
      >
        Clear Identity
      </Text>
    </View>
  );
}

export default function App(): JSX.Element {
  return (
    <FlagsProvider
      environmentToken={process.env.EXPO_PUBLIC_ZENMANAGE_TOKEN || 'mob_placeholder'}
      refreshOnForeground
      backgroundRefreshIntervalMs={120_000}
    >
      <SafeAreaView style={{ flex: 1, padding: 24 }}>
        <HomeScreen />
      </SafeAreaView>
    </FlagsProvider>
  );
}

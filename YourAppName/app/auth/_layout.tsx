import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// You can create a new layout for the Stack to keep things organized.
// For example, this could be in a file like (app)/(stack)/_layout.tsx
// But for a simple fix, you can combine them.
export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        {/*
          Your existing screen components go here,
          for example, the Tabs component from your previous code:
        */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        {/* Add more screens here as needed */}
      </Stack>
    </GestureHandlerRootView>
  );
}
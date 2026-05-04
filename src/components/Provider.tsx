import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebOnlyColorSchemeUpdater } from './ColorSchemeUpdater';
import { WebOnlyPrettyScrollbar } from './PrettyScrollbar'

function Provider({ children }: { children: ReactNode }) {
  return (
    <WebOnlyColorSchemeUpdater>
      <WebOnlyPrettyScrollbar>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {children}
        </GestureHandlerRootView>
      </WebOnlyPrettyScrollbar>
    </WebOnlyColorSchemeUpdater>
  );
}

export {
  Provider,
}

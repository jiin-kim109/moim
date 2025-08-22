import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import * as Sentry from "@sentry/react-native";
import { getEnvironment } from './src/lib/utils';

Sentry.init({
  dsn: "https://9fb8d0fb2909463969ddca54cf2871dc@o4509885025878016.ingest.us.sentry.io/4509885026729984",
  environment: getEnvironment(),
  sendDefaultPii: true,
});

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./src/app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(Sentry.wrap(App));

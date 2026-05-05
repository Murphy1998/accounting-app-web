export default {
  name: '记账APP',
  slug: 'accounting-app',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  platforms: ['web'],
  web: {
    bundler: 'metro',
    output: 'single',
  },
  plugins: [
    'expo-router',
  ],
  experiments: {
    typedRoutes: true
  }
};

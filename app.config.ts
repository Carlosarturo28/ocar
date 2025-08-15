import 'tsx/cjs';
import { ExpoConfig } from 'expo/config';

module.exports = ({ config }: { config: ExpoConfig }) => {
  return {
    ...config,
    plugins: [['./plugins/withAndroidTransparentNavigation.ts']],
  };
};

import 'tsx/cjs';
import { ExpoConfig } from 'expo/config';

module.exports = ({ config }: { config: ExpoConfig }) => {
  plugins: [['./plugins/withAndroidTransparentNavigation.ts']];
};

/* @flow strict-local */
import { Dimensions } from 'react-native';
import composeBoxStyles from './composeBoxStyles';
import { statics as miscStyles } from './miscStyles';
import { statics as navStyles } from './navStyles';
import utilityStyles from './utilityStyles';

export * from './constants';
export type { ThemeData } from './theme';
export { ThemeContext } from './theme';

export function createStyleSheet<+S: ____Styles_Internal>(obj: S): S {
  return Object.freeze(obj);
}

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

const styles = Object.freeze({
  ...composeBoxStyles,
  ...miscStyles,
  ...navStyles,
  ...utilityStyles,
  ...(isLandscape ? {
    padding: utilityStyles.landscapePadding,
    margin: utilityStyles.landscapeMargin,
  } : {}),
});

() => createStyleSheet(styles);

export default styles;

/* @flow strict-local */
import React from 'react';
import { StatusBar } from 'react-native';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSession } from '../directSelectors';
import { getStatusBarColor } from '../utils/color';

/**
 * A component to manage the status bar color and style.
 *
 * This component ensures that the status bar color is consistent
 * across different orientations (portrait and landscape).
 */
export default function ZulipStatusBar(props: {| +backgroundColor: string |}) {
  const themeToUse = useGlobalSelector(state => state.settings.theme);
  const orientation = useGlobalSelector(state => getGlobalSession(state).orientation);
  const backgroundColor = props.backgroundColor;
  const statusBarColor = getStatusBarColor(backgroundColor, themeToUse);

  return (
    // Render the StatusBar component regardless of the device's orientation.
    // This ensures that the status bar color remains consistent in both portrait
    // and landscape modes.
    <StatusBar
      animated
      showHideTransition="slide"
      backgroundColor={statusBarColor}
      barStyle={themeToUse === 'night' ? 'light-content' : 'dark-content'}
    />
  );
}

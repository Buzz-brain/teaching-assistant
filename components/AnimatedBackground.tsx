import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const AnimatedBackground = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 6000, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 6000, useNativeDriver: false })
      ])
    ).start();
  }, [anim]);

  const stop1 = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const stop2 = anim.interpolate({ inputRange: [0, 1], outputRange: ['100%', '0%'] });

  // Animated Stop for SVG gradients
  const AnimatedStop = Animated.createAnimatedComponent(Stop);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}> 
        <Svg height="100%" width="100%" viewBox="0 0 400 900">
          <Defs>
            <RadialGradient id="grad" cx="50%" cy="30%" r="80%">
              <AnimatedStop offset={stop1} stopColor="#60a5fa" stopOpacity="0.25" />
              <AnimatedStop offset={stop2} stopColor="#a21caf" stopOpacity="0.18" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="400" height="900" fill="url(#grad)" />
          <Circle cx="80" cy="120" r="38" fill="#2563eb22" />
          <Circle cx="320" cy="200" r="24" fill="#a21caf22" />
          <Circle cx="200" cy="700" r="60" fill="#22c55e18" />
        </Svg>
      </Animated.View>
      <View style={{ position: 'absolute', top: 320, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: '#a21caf33', opacity: 0.18, filter: 'blur(32px)' }} />
      <View style={{ position: 'absolute', bottom: 80, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: '#2563eb33', opacity: 0.18, filter: 'blur(24px)' }} />
    </View>
  );
};

export default AnimatedBackground;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import MentorCard, { Mentor } from './MentorCard';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const ROTATION_RANGE = 20;

const COLORS = {
  primary: '#7B42F6',
  secondary: '#A5B5FF',
  background: '#F0F3FF',
  success: '#2ECC71',
  danger: '#E74C3C',
  textLight: '#FFFFFF',
  shadowColor: '#000000',
  textDark: '#333333',
};

// Make the data prop optional to handle cases where it might be undefined
const SwipeDeck: React.FC<{
  data?: Mentor[]; 
  onSwipeRight: (mentor: Mentor) => void;
  onSwipeLeft: (mentor: Mentor) => void;
  renderNoMoreCards?: () => React.ReactNode;
}> = ({ data, onSwipeRight, onSwipeLeft, renderNoMoreCards }) => {
  // Add a defensive check here to handle an undefined or null 'data' prop
  if (!data) {
    // You can return a loading state, a message, or simply null to prevent a crash
    console.error("The 'data' prop is missing from SwipeDeck. It must be an array.");
    return (
      <View style={styles.noMoreCardsContainer}>
        <Text style={styles.noMoreCardsText}>Mentor data not available.</Text>
      </View>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useSharedValue(0);

  useEffect(() => {
    position.value = 0;
    setCurrentIndex(0);
  }, [data]);

  const onSwipe = (direction: 'left' | 'right') => {
    const swipeValue = direction === 'right' ? width * 1.5 : -width * 1.5;

    position.value = withSpring(
      swipeValue,
      { damping: 15, stiffness: 150 },
      () => {
        runOnJS(() => {
          if (direction === 'right') {
            onSwipeRight(data[currentIndex]);
          } else {
            onSwipeLeft(data[currentIndex]);
          }
          setCurrentIndex(currentIndex + 1);
          position.value = 0;
        })();
      }
    );
  };

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value },
      {
        rotate: `${interpolate(
          position.value,
          [-width / 2, 0, width / 2],
          [-ROTATION_RANGE, 0, ROTATION_RANGE],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(position.value, [0, SWIPE_THRESHOLD / 2], [0, 1], Extrapolate.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(position.value, [0, -SWIPE_THRESHOLD / 2], [0, 1], Extrapolate.CLAMP),
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(position.value, [-width, 0, width], [1, 0.9, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  if (currentIndex >= data.length) {
    return renderNoMoreCards ? (
      renderNoMoreCards()
    ) : (
      <View style={styles.noMoreCardsContainer}>
        <Text style={styles.noMoreCardsText}>No more mentors!</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => setCurrentIndex(0)}>
          <Text style={styles.refreshButtonText}>Browse Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderedCards = data.map((item, i) => {
    if (i < currentIndex) return null;

    if (i === currentIndex) {
      return (
        <PanGestureHandler
          key={item.id}
          onGestureEvent={(event) => {
            position.value = event.nativeEvent.translationX;
          }}
          onHandlerStateChange={(event) => {
            const translationX = event.nativeEvent.translationX;
            const state = event.nativeEvent.state;

            if (state === State.END) {
              if (translationX > SWIPE_THRESHOLD) {
                onSwipe('right');
              } else if (translationX < -SWIPE_THRESHOLD) {
                onSwipe('left');
              } else {
                position.value = withSpring(0);
              }
            }
          }}
        >
          <Animated.View style={[styles.cardContainer, topCardStyle]}>
            <MentorCard mentor={item} />
            <Animated.View style={[styles.overlay, styles.likeOverlay, likeOpacity]}>
              <Text style={styles.overlayText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOpacity]}>
              <Text style={styles.overlayText}>NOPE</Text>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      );
    }

    if (i === currentIndex + 1) {
      return (
        <Animated.View key={item.id} style={[styles.cardContainer, nextCardStyle]}>
          <MentorCard mentor={item} />
        </Animated.View>
      );
    }

    return (
      <View key={item.id} style={[styles.cardContainer, { transform: [{ scale: 0.8 }] }]}>
        <MentorCard mentor={item} />
      </View>
    );
  }).reverse();

  return (
    <View style={styles.deckContainer}>
      {renderedCards}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onSwipe('left')}>
          <Text style={styles.actionButtonText}>❌ Nope</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onSwipe('right')}>
          <Text style={styles.actionButtonText}>❤️ Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  cardContainer: {
    position: 'absolute',
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    width: '100%',
  },
  noMoreCardsText: {
    fontSize: 22,
    color: COLORS.textDark,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    padding: 10,
    borderRadius: 5,
    borderWidth: 3,
  },
  likeOverlay: {
    left: 20,
    borderColor: COLORS.success,
  },
  nopeOverlay: {
    right: 20,
    borderColor: COLORS.danger,
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '45%',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
});

export default SwipeDeck;
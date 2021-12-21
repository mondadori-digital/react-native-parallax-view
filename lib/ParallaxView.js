import React from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
  Animated,
  InteractionManager,
} from "react-native";
import PropTypes from "prop-types";
var createReactClass = require("create-react-class");

const screen = Dimensions.get("window");
const ScrollViewPropTypes = ScrollView.propTypes;

const ParallaxView = createReactClass({
  propTypes: {
    ...ScrollViewPropTypes,
    windowHeight: PropTypes.number,
    backgroundSource: PropTypes.oneOfType([
      PropTypes.shape({
        uri: PropTypes.string,
      }),
      // Opaque type returned by require('./image.jpg')
      PropTypes.number,
    ]),
    header: PropTypes.node,
    contentInset: PropTypes.object,
    initialPosition: PropTypes.number,
  },

  componentDidMount() {
    // InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      if (this.props.initialPosition && this._scrollView) {
        this._scrollView.scrollTo({
          x: 0,
          y: this.props.initialPosition,
          animated: false,
        });
      }
    }, 0);
  },

  getDefaultProps() {
    return {
      windowHeight: 300,
      contentInset: {
        top: screen.scale,
      },
    };
  },

  getInitialState() {
    return {
      scrollY: new Animated.Value(this.props.initialPosition || 0),
      orientation: screen.width < screen.height ? "portrait" : "landscape",
      width: screen.width,
    };
  },

  getScrollResponder() {
    return this._scrollView.getScrollResponder();
  },

  setNativeProps(props) {
    this._scrollView.setNativeProps(props);
  },

  _handleLayoutChange(event) {
    const { width, height } = event.nativeEvent.layout;
    const orientation = width < height ? "portrait" : "landscape";
    if (orientation !== this.state.orientation) {
      this.setState({
        orientation,
        width,
      });
    }
  },

  renderBackground() {
    const { windowHeight, backgroundSource } = this.props;
    const { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }
    return (
      <Animated.Image
        style={[
          styles.background,
          {
            height: windowHeight,
            width: this.state.width,
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-windowHeight, 0, windowHeight],
                  outputRange: [windowHeight / 2, 0, -windowHeight / 3],
                }),
              },
              {
                scale: scrollY.interpolate({
                  inputRange: [-windowHeight, 0, windowHeight],
                  outputRange: [2, 1, 1],
                }),
              },
            ],
          },
        ]}
        source={backgroundSource}
      />
    );
  },

  renderHeader() {
    const { windowHeight, backgroundSource } = this.props;
    const { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }
    return (
      <Animated.View
        style={{
          position: "relative",
          height: windowHeight,
          opacity: scrollY.interpolate({
            inputRange: [-windowHeight, 0, windowHeight / 1.2],
            outputRange: [1, 1, 0],
          }),
        }}
      >
        {this.props.header}
      </Animated.View>
    );
  },

  render() {
    const { style, ...props } = this.props;
    return (
      <View
        onLayout={this._handleLayoutChange}
        style={[styles.container, style]}
      >
        {this.renderBackground()}
        <ScrollView
          ref={(component) => {
            this._scrollView = component;
          }}
          {...props}
          style={styles.scrollView}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            {
              listener: (event) =>
                props.onScroll ? props.onScroll(event) : event,
            }
          )}
          scrollEventThrottle={props.scrollEventThrottle || 16}
        >
          {this.renderHeader()}
          <View style={[styles.content, props.scrollableViewStyle]}>
            {this.props.children}
          </View>
        </ScrollView>
      </View>
    );
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: "transparent",
  },
  scrollView: {
    backgroundColor: "transparent",
  },
  background: {
    position: "absolute",
    backgroundColor: "#2e2f31",
    resizeMode: "cover",
  },
  content: {
    shadowColor: "#222",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    backgroundColor: "#fff",
    flex: 1,
    flexDirection: "column",
  },
});

module.exports = ParallaxView;

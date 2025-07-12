import React, { useEffect } from "react";
import { View, Image, StyleSheet, StatusBar, Animated } from "react-native";
import { useSelector } from "react-redux";

const SplashScreen = ({ navigation }) => { 
  const fadeAnim = new Animated.Value(0);
  const token = useSelector(state => state.auth.token);
  const role = useSelector(state => state.auth.role);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      if (token) {
        navigation.replace(role === "Partner" ? "Partner" : "User");
      } else {
        navigation.replace("BottomTabBar");
      }
    }, 2500);
  }, [token, role]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <Animated.Image
        source={require("../../assets/Images/Splash.png")}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
});

export default SplashScreen; 
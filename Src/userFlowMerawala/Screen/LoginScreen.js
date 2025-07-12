// Src/UserFlow/Screen/LoginScreen.js
import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import auth from "@react-native-firebase/auth";

const backIcon = require("../../assets/Images/Backward.png");
const forwardIcon = require("../../assets/Images/Forward.png");

const LoginScreen = ({ navigation, route }) => {
  const [phone, setPhone] = useState("");

  const handleContinue = async () => {
    console.log("Continue button pressed");

    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      console.log("Phone number is invalid:", phone);
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
    console.log("Phone number is valid:", phone);

    try {
      console.log("Initiating Firebase phone auth...");
      const formattedPhone = `+91${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      console.log("Firebase OTP sent successfully");

      navigation.navigate("LoginVerifyOtp", {
        phone: formattedPhone,
        confirmation, // Pass Firebase confirmation object
        fromScreen: route?.params?.fromScreen,
        actionAfterLogin: route?.params?.actionAfterLogin,
        itemId: route?.params?.itemId,
      });
    } catch (error) {
      console.error("Firebase auth error:", error.message);
      let errorMessage = "Unable to send OTP";
      if (error.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={backIcon} style={styles.icon} />
      </TouchableOpacity>

      {/* Centered Login Section */}
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Mobile No.*"
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Text style={styles.termsText}>
          By continuing, I agree to the{" "}
          <Text style={styles.linkText}>Terms of Use</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policies.</Text>
        </Text>
      </View>

      {/* Fixed Bottom Section */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleContinue} style={styles.button}>
          <Text style={styles.buttonText}>CONTINUE</Text>
          <Image source={forwardIcon} style={[styles.icon, styles.forwardIcon]} />
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.supportText}>Having trouble logging in? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("UserRegister")}>
            <Text style={styles.whatsappText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    position: "relative",
  },
  backButton: {
   
    position: "absolute",
   marginTop:70,
    left: 20,
    zIndex: 10,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  forwardIcon: {
    marginLeft: 8,
    tintColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#C4C4C4",
    paddingBottom: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  termsText: {
    fontSize: 12,
    color: "#707070",
    marginTop: 15,
    lineHeight: 18,
  },
  linkText: {
    color: "#D67D3E",
    textDecorationLine: "underline",
  },
  bottomContainer: {
    paddingBottom: 30,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#D67D3E",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  supportText: {
    color: "#333",
    fontSize: 14,
  },
  whatsappText: {
    color: "#D6722F",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;


// Src/UserFlow/Screen/RegisterVerificationScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { setAuthToken } from "../../redux/reducers/authReducer";
import { persistor } from "../../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { BASE_URL } from "../../config/apiConfig";

const screenWidth = Dimensions.get("window").width;
const RegisterVerificationScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { name, email, phone, confirmation } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    console.log("Route params at OTP screen:", route?.params);
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev === 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  const handleOTPChange = (value, index) => {
    if (isNaN(value)) return;
    const otpArray = [...otp];
    otpArray[index] = value;
    setOtp(otpArray);
    if (value !== "" && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (value, index) => {
    if (value === "" && index > 0) {
      const otpArray = [...otp];
      otpArray[index - 1] = "";
      setOtp(otpArray);
      inputs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      Alert.alert("Please wait", `You can resend OTP in ${resendCooldown} seconds.`);
      return;
    }

    try {
      const newConfirmation = await auth().signInWithPhoneNumber(phone);
      navigation.setParams({ confirmation: newConfirmation });
      Alert.alert("Success", "OTP resent successfully!");
      setResendCooldown(30);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      let errorMessage = "Failed to resend OTP";
      if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join("");
    if (enteredOTP.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      console.log("Verifying OTP with Firebase...");
      const userCredential = await confirmation.confirm(enteredOTP);
      const idToken = await userCredential.user.getIdToken();
      console.log("Firebase OTP verified, ID token:", idToken);

      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phoneNumber: phone,
          email,
          idToken,
        }),
      });

      const signupData = await signupResponse.json();
      console.log("Signup API Response:", signupData);

      if (!signupResponse.ok || !signupData.success) {
        throw new Error(signupData.message || "Signup failed.");
      }

      const { token, role } = signupData.data;

      // Store user data in Redux
      await dispatch(
        setAuthToken({
          token,
          role,
          user: { name, email, phoneNumber: phone },
        })
      );

      await persistor.flush();
      console.log("Persistor flushed after signup");
      const data = await AsyncStorage.getItem("persist:auth");
      console.log("Saved Auth State:", data ? JSON.parse(data) : null);

      Alert.alert("Success", "Signup successful!", [
        { text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: "UserHome" }] }) },
      ]);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = error.message || "Something went wrong. Please try again.";
      if (error.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid OTP.";
      } else if (error.code === "auth/session-expired") {
        errorMessage = "OTP has expired. Please request a new one.";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require("../../assets/Images/Backward.png")} style={styles.icon} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>OTP Authentication</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your Mobile No.</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  handleBackspace(digit, index);
                }
              }}
            />
          ))}
        </View>

        <Text style={styles.resendText}>
          Didn't receive OTP?{" "}
          <Text
            style={[styles.resendLink, resendCooldown > 0 && { color: "#888" }]}
            onPress={handleResendOTP}
          >
            Resend {resendCooldown > 0 ? `(${resendCooldown}s)` : ""}
          </Text>
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.continueButton} onPress={handleVerifyOTP}>
          <Text style={styles.continueText}>CONTINUE</Text>
          <Image source={require("../../assets/Images/Forward.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Having trouble logging in?{" "}
          <Text
            style={styles.whatsappText}
            onPress={() => Alert.alert("Support", "Contact us via WhatsApp!")}
          >
            Whatsapp Us
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  backButton: {
    marginBottom: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "serif",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  otpInput: {
    fontSize: 18,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#000",
    width: 40,
    marginHorizontal: 6,
  },
  resendText: {
    fontSize: 13,
    color: "#888",
    marginTop: 10,
  },
  resendLink: {
    color: "#D86427",
    fontWeight: "600",
  },
  bottomSection: {
    paddingBottom: 30,
  },
  continueButton: {
    backgroundColor: "#D86427",
    borderRadius: 4,
    paddingVertical: 14,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: "#fff",
    resizeMode: "contain",
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  whatsappText: {
    color: "#D86427",
    fontWeight: "600",
  },
});

export default RegisterVerificationScreen;
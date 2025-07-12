import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { setAuthToken } from "../../redux/reducers/authReducer";
import { persistor } from "../../redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from "../../config/apiConfig";


const LoginVerifyOtpScreen = ({ route, navigation }) => {
  const { fromScreen, actionAfterLogin, itemId, phone, confirmation } = route.params;
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef([]);
  const insets = useSafeAreaInsets(); // Get safe area insets for notch handling

  useEffect(() => {
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

      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, idToken }),
      });

      const loginData = await loginResponse.json();
      console.log("Login API Response:", loginData);

      if (!loginResponse.ok || !loginData.success) {
        throw new Error(loginData.message || "Login failed.");
      }

      const { token, role } = loginData.data;

      // Store user data in Redux
      await dispatch(
        setAuthToken({
          token,
          role,
          user: {
            name: loginData.data.name || "User",
            email: loginData.data.email || "",
            phoneNumber: phone,
          },
        })
      );

      await persistor.flush();
      console.log("Persistor flushed after login");
      const data = await AsyncStorage.getItem("persist:auth");
      console.log("Saved Auth State:", data ? JSON.parse(data) : null);

      const targetScreen =
        role === "Partner"
          ? "PartnnerHome"
          : fromScreen === "SubCategoryScreen" && actionAfterLogin === "like_item"
          ? { name: "SubCategory", params: { likedItemId: itemId } }
          : fromScreen === "Cart"
          ? "Cart"
          : "UserHome";

      navigation.reset({
        index: 0,
        routes: [typeof targetScreen === "string" ? { name: targetScreen } : targetScreen],
      });
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + hp('4%') }]}>
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
    paddingHorizontal: wp('5%'), // Responsive padding (5% of screen width)
  },
  icon: {
    width: wp('6%'), // Responsive icon size (6% of screen width)
    height: wp('6%'),
    resizeMode: "contain",
  },
  backButton: {
    marginBottom: hp('2%'), // Responsive margin (2% of screen height)
    marginLeft: wp('2%'), // Responsive margin (2% of screen width)
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
  },
  title: {
    fontSize: wp('6%'), // Responsive font size (6% of screen width)
    fontWeight: "600",
    fontFamily: "serif",
    marginBottom: hp('2%'), // Responsive margin (2% of screen height)
  },
  subtitle: {
    fontSize: wp('3.5%'), // Responsive font size (3.5% of screen width)
    color: "#555",
    marginBottom: hp('4%'), // Responsive margin (4% of screen height)
    textAlign: "center",
    width: wp('80%'), // Constrain width for readability
    maxWidth: 400, // Prevent excessive stretching
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp('2%'), // Responsive margin (2% of screen height)
    width: wp('80%'), // Constrain width for OTP inputs
    maxWidth: 400, // Prevent excessive stretching
  },
  otpInput: {
    fontSize: wp('4.5%'), // Responsive font size (4.5% of screen width)
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#000",
    width: wp('10%'), // Responsive width (10% of screen width)
    maxWidth: 50, // Cap width for large screens
    marginHorizontal: wp('1.5%'), // Responsive margin (1.5% of screen width)
  },
  resendText: {
    fontSize: wp('3.2%'), // Responsive font size (3.2% of screen width)
    color: "#888",
    marginTop: hp('2%'), // Responsive margin (2% of screen height)
    textAlign: "center",
  },
  resendLink: {
    color: "#D86427",
    fontWeight: "600",
  },
  bottomSection: {
    alignItems: "center", // Center content horizontally
  },
  continueButton: {
    backgroundColor: "#D86427",
    borderRadius: wp('1%'), // Responsive border radius (1% of screen width)
    paddingVertical: hp('2%'), // Responsive padding (2% of screen height)
    width: wp('80%'), // Responsive width (80% of screen width)
    maxWidth: 400, // Prevent excessive stretching
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp('2%'), // Responsive margin (2% of screen height)
  },
  continueText: {
    color: "#fff",
    fontSize: wp('4%'), // Responsive font size (4% of screen width)
    fontWeight: "bold",
    marginRight: wp('2%'), // Responsive margin (2% of screen width)
  },
  arrowIcon: {
    width: wp('4%'), 
    height: wp('4%'),
    tintColor: "#fff",
    resizeMode: "contain",
  },
  footerText: {
    fontSize: wp('3.2%'),
    color: "#666",
    textAlign: "center",
    width: wp('80%'),
    maxWidth: 400, 
  },
  whatsappText: {
    color: "#D86427",
    fontWeight: "600",
  },
});

export default LoginVerifyOtpScreen;
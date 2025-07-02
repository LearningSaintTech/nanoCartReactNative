// Src/UserFlow/Screen/UserRegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import auth from "@react-native-firebase/auth";

const BackIcon = require("../../assets/Images/Backward.png");
const ForwardIcon = require("../../assets/Images/Forward.png");

const CustomCheckbox = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      style={styles.checkboxBase}
      onPress={() => onValueChange(!value)}
    >
      {value && <View style={styles.checkboxTick} />}
    </TouchableOpacity>
  );
};

const UserRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [phone, setPhone] = useState("");

  const handleRegister = async () => {
    console.log("Register button pressed");

    if (!name || !email || !phone) {
      console.log("Missing required fields:", { name, email, phone });
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      console.log("Phone number is invalid:", phone);
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      console.log("Invalid email:", email);
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    console.log("Phone number is valid:", phone);

    try {
      console.log("Initiating Firebase phone auth...");
      const formattedPhone = `+91${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      console.log("Firebase OTP sent successfully");

      navigation.navigate("RegisterVerifyOtp", {
        name,
        email,
        phone: formattedPhone,
        confirmation,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backButtonWrapper}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={BackIcon} style={styles.backIcon} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>Looks like you are new here!</Text>

              <TextInput
                style={styles.input}
                placeholder="Name*"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number*"
                placeholderTextColor="#aaa"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <TextInput
                style={styles.input}
                placeholder="E-mail ID*"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <View style={styles.checkboxContainer}>
                <CustomCheckbox
                  value={isSubscribed}
                  onValueChange={setIsSubscribed}
                />
                <Text style={styles.checkboxText}>
                  Email me for offers and updates.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <View style={styles.registerContent}>
                <Text style={styles.registerText}>REGISTER</Text>
                <Image source={ForwardIcon} style={styles.forwardIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Having trouble logging in?{" "}
              <Text style={styles.whatsappText}>Whatsapp Us</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  container: {
    padding: 25,
    paddingTop: 80,
  },
  backButtonWrapper: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    fontFamily: "serif",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 30,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 25,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    marginLeft: 12,
    color: "#555",
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#D86427",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: "#D86427",
    borderRadius: 2,
  },
  bottomSection: {
    padding: 25,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  registerButton: {
    backgroundColor: "#D86427",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 15,
  },
  registerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  registerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forwardIcon: {
    width: 16,
    height: 16,
    tintColor: "#fff",
    resizeMode: "contain",
  },
  footerText: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
  },
  whatsappText: {
    color: "#D86427",
    fontWeight: "600",
  },
});

export default UserRegisterScreen;
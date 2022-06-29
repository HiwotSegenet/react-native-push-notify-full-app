import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TextInput, Text, View, Button } from "react-native";
import { getDatabase, ref, update } from "firebase/database";
import { getAuth, updateProfile, deleteUser } from "firebase/auth";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

const Home = (props) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [profiledata, setProfileData] = useState({
    name: user ? user.providerData[0].displayName : "",
  });

  const db = getDatabase();

  const profileRef = ref(db, "profiles/" + props.userId);

  useEffect(() => {
    update(profileRef, {
      name: user ? user.providerData[0].displayName : "",
    });
  });
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
  }, []);

  const signout = () => {
    props.userAuth.signOut();
  };
  const onChangeText = (text, field) => {
    setProfileData({ ...profiledata, [field]: text });
  };
  const onSubmit = () => {
    updateProfile(user, {
      displayName: profiledata.name,
    })
      .then(() => {
        console.log("successfully saved");
        console.log(user.providerData[0]);
      })
      .catch((error) => {
        console.log("error ==>", error);
      });
    update(profileRef, {
      name: profiledata.name,
    });
  };
  useEffect(() => {
    if (props.userId === "") {
      props.navigation.navigate("Auth");
    }
  }, [props.userId]);
  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Token is ==>", token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }
  return (
    <View style={styles.container}>
      <Text> Hello from Home</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        onChangeText={(str) => onChangeText(str, "name")}
        onBlur={() => onSubmit()}
        value={profiledata.name === null ? "" : profiledata.name}
      />
      <Button onPress={signout} title="Sign Out" />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flexDirection: "row",
    padding: 19,
    borderColor: "#ADB3BC",
    color: "#ADB3BC",
    backgroundColor: "white",
    textAlign: "left",
    width: 350,
    borderBottomWidth: 2,
  },
});

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  View,
  Button,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { getDatabase, ref, update, onValue, set } from "firebase/database";
import { getAuth, updateProfile, deleteUser } from "firebase/auth";
import * as Device from "expo-device";
import axios from "axios";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// const Item = ({ name }) => (
//   <View key={index}>
//     <Text>{name}</Text>
//   </View>
// );

const Home = (props) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [profiledata, setProfileData] = useState({
    name: user ? user.providerData[0].displayName : "",
  });
  const [inputText, setInputText] = useState("");
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersTokens, setAllUsersTokens] = useState([]);

  const db = getDatabase();

  const profileRef = ref(db, "profiles/" + props.userId);
  const allProfilesRef = ref(db, "profiles/");

  useEffect(() => {
    update(profileRef, {
      name: user ? user.providerData[0].displayName : "",
      token: expoPushToken ? expoPushToken : "",
    });
  });
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
  }, []);

  useEffect(() => {
    return onValue(allProfilesRef, (snapshot) => {
      if (snapshot.val() !== null) {
        const data = snapshot.val();
        let result = Object.keys(data).map((key) => data[key]);

        // let allUsers = [];
        // let userTokens = [];
        setAllUsers(result);
        // result.map((item) => {
        //   allUsers.push(item.name);
        //   userTokens.push(item.token);
        // });

        // setAllUsers(allUsers);
        // setAllUsersTokens(userTokens);
      }
    });
  });
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

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { someData: "goes here" },
    };

    await fetch("http://localhost:5050/notify/notification", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }

  // const renderItem = ({ item }) => <Item name={item.name} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text> Hello from Home</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        onChangeText={(str) => onChangeText(str, "name")}
        onBlur={() => onSubmit()}
        value={profiledata.name === null ? "" : profiledata.name}
      />
      <Button onPress={signout} title="Sign Out" />
      <View>
        <FlatList
          data={allUsers}
          renderItem={({ item, index }) => (
            //  console.log({ item })

            <View key={index} style={styles.fList}>
              <Text style={styles.nameText}>{item.name}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  input: {
    flexDirection: "row",
    // marginTop: -6,
    padding: 19,
    borderColor: "#ADB3BC",
    color: "#ADB3BC",
    backgroundColor: "white",
    textAlign: "left",
    width: 350,
    borderBottomWidth: 2,
  },
  fList: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  nameText: {
    color: "#000",
    fontSize: 32,
    textAlign: "center",
  },
});

import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";

const Profile = (props) => {
  return (
    <View>
      <Text>Profile</Text>
      <Button title="Home" onPress={() => props.navigation.navigate("Home")} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});

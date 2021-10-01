import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Button,
  Alert
} from "react-native";
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { RFValue } from "react-native-responsive-fontsize";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import firebase from "firebase";

let customFonts = {
  "Bubblegum-Sans": require("../assets/fonts/BubblegumSans-Regular.ttf")
};

async function uploadImageAsync(uri) {
  let uint6_t=Math.random().toString(36).slice(2);
  var response = await fetch(uri);
  var blob = await response.blob();
  const ref = firebase.storage().ref('/').child(uint6_t);
  const snapshot = await ref.put(blob);
  console.log(snapshot.ref.getDownloadURL());
  return await snapshot.ref.getDownloadURL();
}

export default class CreateStory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fontsLoaded: false,
      previewImage: "arduino",
      light_theme: true,
      dropdownHeight: 40,
      image:'',
      url:'',
      status:'',
    };
  }

  getPermission=async()=>{
    if(Platform.OS!=='web'){
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if(status!=='granted'){
        alert("Sorry ,we need your gallery permission to proceed !");
      }else{
        this.setState({status:status})
      }
    }
  }

  getImage=async()=>{
    let {cancelled,uri}=await ImagePicker.launchImageLibraryAsync({
      allowsEditing:true,
      aspect:[4,3],
      quality:1
    });
    if(!cancelled){
      this.setState({image:uri})
      let url=uploadImageAsync(uri);
      let Url=url._W;
      console.log(Url);
      this.setState({url:url})
    }
  }

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
    this.fetchUser();
  }

  async addStory() {
    if (
      this.state.title &&
      this.state.description &&
      this.state.story &&
      this.state.moral
    ) {
      let storyData = {
        preview_image: this.state.url,
        title: this.state.title,
        description: this.state.description,
        story: this.state.story,
        moral: this.state.moral,
        author: firebase.auth().currentUser.displayName,
        created_on: new Date(),
        author_uid: firebase.auth().currentUser.uid,
        likes: 0
      };
      await firebase
        .database()
        .ref(
          "/projectPosts/" +
            Math.random()
              .toString(36)
              .slice(2)
        )
        .set(storyData)
        .then(function(snapshot) {});
      this.props.setUpdateToTrue();
      this.props.navigation.navigate("Feed");
    } else {
      Alert.alert(
        "Error",
        "All fields are required!",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  }

  fetchUser = () => {
    let theme;
    firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid)
      .on("value", snapshot => {
        theme = snapshot.val().current_theme;
        this.setState({ light_theme: theme === "light" });
      });
  };

  render() {
    if (!this.state.fontsLoaded) {
      return <AppLoading />;
    } else {
      return (
        <View
          style={
            this.state.light_theme ? styles.containerLight : styles.container
          }
        >
          <SafeAreaView style={styles.droidSafeArea} />
          <View style={styles.appTitle}>
            <View style={styles.appIcon}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.iconImage}
              ></Image>
            </View>
            <View style={styles.appTitleTextContainer}>
              <Text
                style={
                  this.state.light_theme
                    ? styles.appTitleTextLight
                    : styles.appTitleText
                }
              >
                New Posts :-
              </Text>
            </View>
          </View>
          <View style={styles.fieldsContainer}>
            <ScrollView>
              <Image
                source={this.state.image!==''?{uri:this.state.image}:require('../assets/arduino.png')}
                style={styles.previewImage}
              ></Image>
              <View style={{ marginHorizontal: RFValue(10) }}>
                <TouchableOpacity
                    style={this.state.light_theme?styles.selton:styles.seltonDark}
                    onPress={()=>{
                      this.state.status==='granted'?this.getImage():this.getPermission();
                    }}
                  >
                  <Text style={this.state.light_theme?styles.seltonText:styles.seltonTextDark}>Select image from your gallery !</Text>
                </TouchableOpacity>
                <TextInput
                  style={
                    this.state.light_theme
                      ? styles.inputFontLight
                      : styles.inputFont
                  }
                  onChangeText={title => this.setState({ title })}
                  placeholder={"Title"}
                  placeholderTextColor={
                    this.state.light_theme ? "black" : "white"
                  }
                />
                <TextInput
                  style={[
                    this.state.light_theme
                      ? styles.inputFontLight
                      : styles.inputFont,
                    styles.inputFontExtra,
                    styles.inputTextBig
                  ]}
                  onChangeText={description => this.setState({ description })}
                  placeholder={"Description"}
                  multiline={true}
                  numberOfLines={4}
                  placeholderTextColor={
                    this.state.light_theme ? "black" : "white"
                  }
                />
                <TextInput
                  style={[
                    this.state.light_theme
                      ? styles.inputFontLight
                      : styles.inputFont,
                    styles.inputFontExtra,
                    styles.inputTextBig
                  ]}
                  onChangeText={story => this.setState({ story })}
                  placeholder={"Story"}
                  multiline={true}
                  numberOfLines={20}
                  placeholderTextColor={
                    this.state.light_theme ? "black" : "white"
                  }
                />
                <TextInput
                  style={[
                    this.state.light_theme
                      ? styles.inputFontLight
                      : styles.inputFont,
                    styles.inputFontExtra,
                    styles.inputTextBig
                  ]}
                  onChangeText={moral => this.setState({ moral })}
                  placeholder={"Practical applications of project"}
                  multiline={true}
                  numberOfLines={4}
                  placeholderTextColor={
                    this.state.light_theme ? "black" : "white"
                  }
                />
              </View>
              <View style={styles.submitButton}>
                <Button
                  onPress={() => this.addStory()}
                  title="Submit"
                  color="#841584"
                />
              </View>
            </ScrollView>
          </View>
          <View style={{ flex: 0.08 }} />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  selton:{
    borderColor:'#15193c',
    borderWidth:1,
    width:RFValue(345),
    height:RFValue(45),
    borderRadius:11.125,
    alignSelf:'center',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:RFValue(10)
  },
  seltonText:{
    color:"#15193c",
    fontFamily:'Bubblegum-Sans',
    fontSize:RFValue(17.5)
  },
  seltonDark:{
    borderColor:'white',
    borderWidth:1,
    width:RFValue(345),
    height:RFValue(45),
    borderRadius:11.125,
    alignSelf:'center',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:RFValue(10)
  },
  seltonTextDark:{
    color:"white",
    fontFamily:'Bubblegum-Sans',
    fontSize:RFValue(17.5)
  },
  container: {
    flex: 1,
    backgroundColor: "#15193c"
  },
  containerLight: {
    flex: 1,
    backgroundColor: "white"
  },
  droidSafeArea: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
  },
  appTitle: {
    flex: 0.07,
    flexDirection: "row"
  },
  appIcon: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center"
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  appTitleTextContainer: {
    flex: 0.7,
    justifyContent: "center"
  },
  appTitleText: {
    color: "white",
    fontSize: RFValue(28),
    fontFamily: "Bubblegum-Sans"
  },
  appTitleTextLight: {
    color: "black",
    fontSize: RFValue(28),
    fontFamily: "Bubblegum-Sans"
  },
  fieldsContainer: {
    flex: 0.85
  },
  previewImage: {
    width: "93%",
    height: RFValue(250),
    alignSelf: "center",
    borderRadius: RFValue(10),
    marginVertical: RFValue(10),
    resizeMode: "contain"
  },
  inputFont: {
    height: RFValue(40),
    borderColor: "white",
    borderWidth: RFValue(1),
    borderRadius: RFValue(10),
    paddingLeft: RFValue(10),
    color: "white",
    fontFamily: "Bubblegum-Sans"
  },
  inputFontLight: {
    height: RFValue(40),
    borderColor: "black",
    borderWidth: RFValue(1),
    borderRadius: RFValue(10),
    paddingLeft: RFValue(10),
    color: "black",
    fontFamily: "Bubblegum-Sans"
  },
  dropdownLabel: {
    color: "white",
    fontFamily: "Bubblegum-Sans"
  },
  dropdownLabelLight: {
    color: "black",
    fontFamily: "Bubblegum-Sans"
  },
  inputFontExtra: {
    marginTop: RFValue(15)
  },
  inputTextBig: {
    textAlignVertical: "top",
    padding: RFValue(5)
  },
  submitButton: {
    marginTop: RFValue(20),
    alignItems: "center",
    justifyContent: "center"
  }
});

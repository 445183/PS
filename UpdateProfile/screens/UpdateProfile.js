import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  TextInput
} from "react-native";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import { RFValue } from "react-native-responsive-fontsize";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";

import firebase from "firebase";
import { TouchableOpacity } from "react-native-gesture-handler";

let customFonts = {
  "Bubblegum-Sans": require("../assets/fonts/BubblegumSans-Regular.ttf")
};

async function uploadImageAsync(uri) {
    var response = await fetch(uri);
    var blob = await response.blob();
    const ref = firebase.storage().ref('/').child(firebase.auth().currentUser.uid);
    const snapshot = await ref.put(blob);
    console.log(snapshot.ref.getDownloadURL());
    return await snapshot.ref.getDownloadURL();
}

export default class UpdateProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status:'',
      fontsLoaded: false,
      isEnabled: false,
      first_name:'',
      last_name:'',
      light_theme: true,
      profile_image: "",
      p2:'',
      name: "",
      first:'',
      last:'',
      url:{},
      img:'',
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
      aspect:[1,1],
      quality:1
    });
    if(!cancelled){
      uploadImageAsync(uri);
      let img=await firebase.storage().ref('/'+firebase.auth().currentUser.uid).getDownloadURL();
      await firebase.database().ref('/users/'+firebase.auth().currentUser.uid).update({
        profile_picture:img
      });
      this.setState({p2:img})
    }
  }
  updateFirstName=async(name)=>{
    console.log(name);
    await firebase.database().ref('/users/'+firebase.auth().currentUser.uid).update({first_name:name});
  }
  updateLastName=async(name)=>{
    console.log(name);
    await firebase.database().ref('/users/'+firebase.auth().currentUser.uid).update({last_name:name});
  }

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
    this.fetchUser();
  }

  async fetchUser() {
    let theme, name, image, first_name, last_name;
    await firebase
      .database()
      .ref("/users/" + firebase.auth().currentUser.uid)
      .on("value", function (snapshot) {
        theme = snapshot.val().current_theme;
        name = `${snapshot.val().first_name} ${snapshot.val().last_name}`;
        image = snapshot.val().profile_picture;
        first_name=snapshot.val().first_name;
        last_name=snapshot.val().last_name;
      });
    this.setState({
      light_theme: theme === "light" ? true : false,
      isEnabled: theme === "light" ? false : true,
      name: name,
      profile_image: image,
      first_name:first_name,
      last_name:last_name,
    });
  }

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
                Update Profile !
              </Text>
            </View>
          </View>
          <View style={styles.screenContainer}>
            <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={()=>{
                    this.state.status==='granted'?this.getImage():this.getPermission();
                }}
                >
                <Image
                    source={this.state.p2===''?require('../assets/profile.jpg'):{uri:this.state.p2}}
                    style={styles.profileImage}
                ></Image>
                </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-around'}}>
              <TextInput
                style={
                  this.state.light_theme
                    ? styles.inputFontLight
                    : styles.inputFont
                  }
                onChangeText={val => this.setState({first:val})}
                placeholder={this.state.first_name+'-'}
                placeholderTextColor={
                  this.state.light_theme ? "black" : "white"
                }
              />
              <TextInput
                style={
                  this.state.light_theme
                    ? styles.inputFontLight
                    : styles.inputFont
                  }
                onChangeText={val => this.setState({last:val})}
                placeholder={this.state.last_name+'-'}
                placeholderTextColor={
                  this.state.light_theme ? "black" : "white"
                }
              />
          </View>
              <TouchableOpacity
               onPress={()=>{
                 this.updateFirstName(this.state.first);
                 this.updateLastName(this.state.last);
               }}
               style={this.state.light_theme?styles.button:styles.buttonDark}
              >
                 <Text style={this.state.light_theme?styles.seltonText:styles.seltonTextDark}>Update your profile now !</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 0.3 }} />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  inputFont: {
    height: RFValue(40),
    width: RFValue(175),
    borderColor: "white",
    borderWidth: RFValue(1),
    borderRadius: RFValue(10),
    paddingLeft: RFValue(10),
    color: "white",
    fontFamily: "Bubblegum-Sans",
  },
  button:{
    alignSelf:"center",
    margin:RFValue(30),
    borderColor:'black',
    borderWidth:1,
    width:RFValue(300),
    height:RFValue(45),
    borderRadius:RFValue(11.125),
    alignItems:'center',
    justifyContent:'center'
  },
  buttonDark:{
    alignSelf:"center",
    margin:RFValue(30),
    borderColor:'white',
    borderWidth:1,
    width:RFValue(300),
    height:RFValue(45),
    borderRadius:RFValue(11.125),
    alignItems:'center',
    justifyContent:'center'
  },
  inputFontLight: {
    height: RFValue(40),
    width: RFValue(175),
    borderColor: "black",
    borderWidth: RFValue(1),
    borderRadius: RFValue(10),
    paddingLeft: RFValue(10),
    color: "black",
    fontFamily: "Bubblegum-Sans"
  },
    selton:{
        marginLeft:RFValue(5),
        borderColor:'#15193c',
        borderWidth:1,
        width:RFValue(175),
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
        fontSize:RFValue(14.5)
      },
      seltonDark:{
        marginLeft:RFValue(5),
        borderColor:'white',
        borderWidth:1,
        width:RFValue(175),
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
        fontSize:RFValue(14.5)
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
  screenContainer: {
    flex: 0.85
  },
  profileImageContainer: {
    flex: 0.7,
    flexDirection:'row',
    justifyContent: "center",
    alignItems: "center"
  },
  profileImage: {
    width: RFValue(175),
    height: RFValue(175),
    borderRadius: RFValue(87.5)
  },

  nameText: {
    color: "white",
    fontSize: RFValue(20),
    fontFamily: "Bubblegum-Sans",
    marginTop: RFValue(10)
  },
  nameTextLight: {
    color: "black",
    fontSize: RFValue(20),
    fontFamily: "Bubblegum-Sans",
    marginTop: RFValue(10)
  },
  themeContainer: {
    flex: 0.2,
    flexDirection: "row",
    alignItems:'center',
    justifyContent: "center",
  },
  themeText: {
    color: "white",
    fontSize: RFValue(17.5),
    fontFamily: "Bubblegum-Sans",
    marginRight: RFValue(15)
  },
  themeTextLight: {
    color: "black",
    fontSize: RFValue(17.5),
    fontFamily: "Bubblegum-Sans",
    marginRight: RFValue(15)
  },
});
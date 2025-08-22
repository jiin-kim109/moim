export default {
  expo: {
    name: "moim",
    slug: "moim",
    scheme: "moim",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF'
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.moim.ios",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.moim.android",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    assetBundlePatterns: [
      "assets/*",
      "assets/sounds/*"
    ],
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
          defaultChannel: "default",
          sounds: [
            "./assets/sounds/notification.wav"
          ],
          enableBackgroundRemoteNotifications: false
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Moim to use your location to find nearby communities and chatrooms.",
          locationWhenInUsePermission: "Allow Moim to use your location to find nearby communities and chatrooms.",
          locationAlwaysPermission: "Allow Moim to use your location to find nearby communities and chatrooms.",
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.948856109331-erbv9k0mnef62ci4o8cd6200mgbv59nr"
        }
      ]
    ],
    extra: {
      router: {},
      eas: {
        projectId: "21e92255-5027-4edb-a0b7-7c02a9001f5d"
      }
    }
  }
};

# Setup

1.  From the root directory of the boardgame.io repo, run `yarn run prepare && yarn run prepublishOnly`
1.  After the packages have built, run `yarn link` to register the `boardgame.io` module
1.  From the `examples/react-native` directory, run `yarn link "boardgame.io"` to install the registered module locally for the example app
1.  Also run `yarn install` to install package.json dependencies
1.  Everything should be working and linked together– run `yarn start` to start the native packager!

---

This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

Below you'll find information about performing common tasks. The most recent version of this guide is available [here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).

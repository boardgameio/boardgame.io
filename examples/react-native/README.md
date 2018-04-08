# Setup

1. Go to `examples/react-native`.
1. Run `npm install`.
1. Run `npm start`.

### Platform specific issues and how to fix them

#### Linux

You may have to run the following to get it to work on Linux:

```
$ sudo sysctl -w fs.inotify.max_user_instances=1024
$ sudo sysctl -w fs.inotify.max_user_watches=12288
```

#### MacOS

Install `watchman` from HomeBrew on Mac.

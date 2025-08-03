const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

const enableAsar = !process.env.DEBUG;
module.exports = {
  packagerConfig: {
    asar: enableAsar,
    ignore: ["src", /^\..*/],
    icon: "./src/static/icon",
  },
  rebuildConfig: {
    force: true,
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "legendecas",
          name: "gh-inbox",
        },
        prerelease: true,
      },
    },
  ],
  plugins: [
    ...(enableAsar
      ? [
          {
            name: "@electron-forge/plugin-auto-unpack-natives",
            config: {},
          },
        ]
      : []),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

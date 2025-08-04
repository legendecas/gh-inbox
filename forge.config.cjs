const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const { $ } = require("zx");

const ignorePaths = [
  /\.git/,
  /^\/\./,
  /^\/node_modules/,
  /^\/scripts/,
  /^\/src/,
  /^\/eslint.config.mjs/,
  /^\/forge.config.cjs/,
  /^\/tsconfig/,
];
const enableAsar = !process.env.DEBUG;
module.exports = {
  packagerConfig: {
    asar: enableAsar,
    junk: true,
    prune: false,
    afterCopy: [
      (buildPath, _electronVersion, _platform, _arch, callback) => {
        (async () => {
          $.verbose = true;
          $.cwd = buildPath;
          await $`npm ci --omit=dev --omit=optional --omit=peer`;
        })().then(() => {
          callback();
        }, err => {
          callback(err);
        });
      },
    ],
    ignore: (filePath) => {
      return ignorePaths.some((pattern) => {
        if (typeof pattern === "string") {
          return filePath.includes(pattern);
        } else if (pattern instanceof RegExp) {
          return pattern.test(filePath);
        }
        return false;
      });
    },
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

const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const fs = require("node:fs");
const childProcess = require("node:child_process");

const enableAsar = !process.env.DEBUG;
const projectDir = __dirname;
module.exports = {
  packagerConfig: {
    asar: enableAsar,
    ignore: ["src", /^\..*/],
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
          owner: "github-user-name",
          name: "github-repo-name",
        },
        prerelease: false,
        draft: true,
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
  hooks: {
    generateAssets: async (_forgeConfig) => {
      childProcess.execSync("npm run build", {
        stdio: "inherit",
        cwd: projectDir,
      });

      fs.globSync("src/app/**/*.html", { cwd: projectDir }).forEach((file) => {
        fs.copyFileSync(file, file.replace("src/", "dist/"));
      });

      fs.globSync("src/static/**/*", { cwd: projectDir }).forEach((file) => {
        fs.copyFileSync(file, file.replace("src/", "dist/"));
      });
    },
  },
};

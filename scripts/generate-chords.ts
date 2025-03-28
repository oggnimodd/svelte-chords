import { promises as fs } from "fs";
import path from "path";

// Helper function to run a command using Bun.spawn.
async function runCommand(cmd: string, args: string[], cwd?: string) {
  const child = Bun.spawn({
    cmd: [cmd, ...args],
    cwd: cwd || process.cwd(),
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited with code ${exitCode}`);
  }
}

async function main() {
  const repoUrl = "https://github.com/oggnimodd/chords-db.git";
  const repoDir = path.join(process.cwd(), "chords-db");

  // If the repository already exists, remove it.
  try {
    await fs.stat(repoDir);
    console.log(`Directory ${repoDir} exists, removing it...`);
    await fs.rm(repoDir, { recursive: true, force: true });
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }

  console.log("Cloning repository...");
  await runCommand("git", ["clone", repoUrl]);

  // Always create a fresh lib folder inside the cloned repo.
  const libFolder = path.join(repoDir, "lib");
  console.log("Creating a fresh lib folder in the cloned repo...");
  // Remove any existing lib folder if it exists.
  await fs.rm(libFolder, { recursive: true, force: true });
  // Create a new lib folder.
  await fs.mkdir(libFolder, { recursive: true });

  console.log(
    "Changing directory to cloned repo and installing dependencies..."
  );
  await runCommand("bun", ["install"], repoDir);

  console.log("Generating the chords library...");
  await runCommand("bun", ["run", "build"], repoDir);

  console.log("Moving the generated library to the target folder...");
  // The generated library is assumed to be in the "lib" folder inside the repo.
  const generatedDir = path.join(repoDir, "lib");
  // Target folder is now "./src/chords-db" relative to process.cwd()
  const targetDir = path.join(process.cwd(), "./src/chords-db");

  // Ensure the parent directory of the target folder exists.
  await fs.mkdir(path.dirname(targetDir), { recursive: true });

  // Remove the target folder if it already exists.
  await fs.rm(targetDir, { recursive: true, force: true });

  // Move (rename) the generated folder to the target location.
  await fs.rename(generatedDir, targetDir);

  console.log("Cleaning up the cloned repository...");
  // Remove the cloned repository folder.
  await fs.rm(repoDir, { recursive: true, force: true });

  console.log("All done!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

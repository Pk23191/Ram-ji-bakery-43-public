const { spawn, spawnSync } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

const children = [];
let shuttingDown = false;

function prefixOutput(prefix, stream) {
  let buffered = "";

  stream.on("data", (chunk) => {
    buffered += chunk.toString();
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length > 0) {
        process.stdout.write(`[${prefix}] ${line}\n`);
      }
    }
  });

  stream.on("end", () => {
    if (buffered.length > 0) {
      process.stdout.write(`[${prefix}] ${buffered}\n`);
    }
  });
}

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      if (isWindows) {
        spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
          stdio: "ignore",
          windowsHide: true
        });
      } else {
        child.kill("SIGTERM");
      }
    }
  }

  setTimeout(() => process.exit(exitCode), 500);
}

function getCommandSpec(args) {
  if (isWindows) {
    return {
      command: process.env.ComSpec || "cmd.exe",
      args: ["/d", "/s", "/c", "npm.cmd", ...args]
    };
  }

  return {
    command: "npm",
    args
  };
}

function startService(name, cwd, args) {
  const commandSpec = getCommandSpec(args);
  const child = spawn(commandSpec.command, commandSpec.args, {
    cwd,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
    windowsHide: false
  });

  children.push(child);
  prefixOutput(name, child.stdout);
  prefixOutput(name, child.stderr);

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const details = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    process.stderr.write(`[${name}] exited with ${details}\n`);
    stopAll(code ?? 1);
  });

  child.on("error", (error) => {
    if (shuttingDown) {
      return;
    }

    process.stderr.write(`[${name}] failed to start: ${error.message}\n`);
    stopAll(1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
process.on("exit", () => stopAll(0));
process.on("uncaughtException", (error) => {
  process.stderr.write(`[dev] ${error.message}\n`);
  stopAll(1);
});

startService("client", path.join(rootDir, "client"), ["run", "dev"]);
startService("server", path.join(rootDir, "server"), ["run", "dev"]);

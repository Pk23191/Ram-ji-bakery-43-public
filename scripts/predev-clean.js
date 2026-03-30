const { execFileSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORTS_TO_CLEAN = [3000, 5000, 5173];
const rootDir = path.resolve(__dirname, "..");
const clientDir = path.join(rootDir, "client");
const serverDir = path.join(rootDir, "server");
const isWindows = process.platform === "win32";

function log(message) {
  process.stdout.write(`${message}\n`);
}

function runCommand(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      ...options
    });
  } catch (error) {
    return (error.stdout || error.stderr || "").toString();
  }
}

function normalizeOutput(value) {
  return String(value || "").trim();
}

function uniqueNumbers(values) {
  return [...new Set(values.filter((value) => Number.isInteger(value) && value > 0))];
}

function killPid(pid, reason) {
  if (!pid || pid === process.pid) {
    return false;
  }

  try {
    if (isWindows) {
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });
    } else {
      process.kill(pid, "SIGKILL");
    }

    log(`Killed process ${pid}${reason ? ` (${reason})` : ""}`);
    return true;
  } catch (error) {
    return false;
  }
}

function getPidsUsingPortWindows(port) {
  const output = runCommand("netstat", ["-ano", "-p", "tcp"]);
  const lines = normalizeOutput(output).split(/\r?\n/);
  const pids = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith("TCP")) {
      continue;
    }

    const parts = trimmed.split(/\s+/);
    const localAddress = parts[1] || "";
    const pid = Number.parseInt(parts[parts.length - 1], 10);

    if (localAddress.endsWith(`:${port}`) && Number.isInteger(pid)) {
      pids.push(pid);
    }
  }

  return uniqueNumbers(pids);
}

function getPidsUsingPortUnix(port) {
  const output = runCommand("lsof", ["-ti", `tcp:${port}`]);
  return uniqueNumbers(
    normalizeOutput(output)
      .split(/\r?\n/)
      .map((line) => Number.parseInt(line.trim(), 10))
  );
}

function getPidsUsingPort(port) {
  return isWindows ? getPidsUsingPortWindows(port) : getPidsUsingPortUnix(port);
}

function killPort(port) {
  const pids = getPidsUsingPort(port);

  if (!pids.length) {
    log(`Port ${port} is free`);
    return;
  }

  log(`Killing process on port ${port}...`);
  pids.forEach((pid) => killPid(pid, `port ${port}`));
}

function parseWindowsProcesses() {
  const script = [
    "$root = $args[0]",
    "Get-CimInstance Win32_Process |",
    "Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine } |",
    "Select-Object ProcessId, ParentProcessId, CommandLine |",
    "ConvertTo-Json -Compress"
  ].join(" ");

  const raw = runCommand("powershell", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script,
    "--%",
    rootDir
  ]);

  const normalized = normalizeOutput(raw);
  if (!normalized) {
    return [];
  }

  try {
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    return [];
  }
}

function parseUnixProcesses() {
  const output = runCommand("ps", ["-axo", "pid=,ppid=,command="]);

  return normalizeOutput(output)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(\d+)\s+(.*)$/);
      if (!match) {
        return null;
      }

      return {
        ProcessId: Number.parseInt(match[1], 10),
        ParentProcessId: Number.parseInt(match[2], 10),
        CommandLine: match[3]
      };
    })
    .filter(Boolean);
}

function getNodeProcesses() {
  return (isWindows ? parseWindowsProcesses() : parseUnixProcesses()).filter((processInfo) =>
    String(processInfo.CommandLine || "").toLowerCase().includes("node")
  );
}

function isBakeryDevProcess(commandLine = "") {
  const value = String(commandLine || "").toLowerCase();
  const root = rootDir.toLowerCase();
  const client = clientDir.toLowerCase();
  const server = serverDir.toLowerCase();

  return (
    value.includes(root) ||
    value.includes(client) ||
    value.includes(server) ||
    value.includes("next dev") ||
    value.includes("next\\dist\\bin\\next") ||
    value.includes("next/dist/bin/next") ||
    value.includes("vite") ||
    value.includes("nodemon") ||
    value.includes("server.js")
  );
}

function killZombieNodeProcesses() {
  const processes = getNodeProcesses().filter((processInfo) => isBakeryDevProcess(processInfo.CommandLine));
  const killed = [];

  for (const processInfo of processes) {
    if (killPid(processInfo.ProcessId, "stale dev process")) {
      killed.push(processInfo.ProcessId);
    }
  }

  if (!killed.length) {
    log("No stale Node/Next dev processes found");
  }
}

function clearNextCache() {
  const nextDir = path.join(clientDir, ".next");

  try {
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      log("Cleared client/.next cache");
      return;
    }
  } catch (error) {
    log(`Skipping cache cleanup: ${error.message}`);
    return;
  }

  log("client/.next cache already clean");
}

function main() {
  log("Starting predev cleanup...");
  killZombieNodeProcesses();
  PORTS_TO_CLEAN.forEach(killPort);
  clearNextCache();
  log("Predev cleanup complete");
}

main();

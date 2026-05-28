import { exec } from "child_process";

export function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
        return;
      }

      resolve(stdout);
    });
  });
}
import "dotenv/config";
import { createReadStream } from "fs";
import { appendFile } from "fs/promises";
import * as readline from "readline";

const INPUT_FILE = "generated_nicks.txt";
const OUTPUT_FILE = "available.txt";
const INTERVAL_MS = 3000;

async function checkNick(username: string) {
  if (!process.env.HYTALE_COOKIE) {
    console.error(`[ERR] HYTALE_COOKIE not set in environment variables`);
    return;
  }

  try {
    const res = await fetch(
      `https://accounts.hytale.com/api/account/username-reservations/availability?username=${username}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "text/html",
          Cookie: process.env.HYTALE_COOKIE || "",
        },
      }
    );

    switch (res.status) {
      case 200:
        await appendFile(OUTPUT_FILE, username + "\n");
        console.log(`[OK] ${username} → SAVED | (${res.status})`);
        break;
      case 400:
        console.error(`[SKIP] ${username} taken | (${res.status})`);
        break;
      default:
        console.error(
          `[ERR] ${username} status=${res.status} | ${await res.text()}`
        );
        break;
    }
  } catch (e) {
    console.error(`[ERR] ${username} ${(e as Error).message}`);
  }
}

async function main() {
  const fileStream = createReadStream(INPUT_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const username = line.trim();
    if (!username) continue;

    await checkNick(username);
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

main();

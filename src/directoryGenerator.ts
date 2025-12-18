import { createWriteStream } from "fs";
import { readFile } from "fs/promises";

interface Config {
  letters_replace: Record<string, string[]>;
  alphabet: string[];
  length: { min: number; max: number };
}

async function loadConfig(): Promise<Config> {
  const data = await readFile("./src/config.json", "utf-8");
  return JSON.parse(data);
}

function* letterVariants(
  letter: string,
  letters_replace: Record<string, string[]>
): Generator<string> {
  yield letter;
  if (letters_replace[letter]) {
    for (const rep of letters_replace[letter]) yield rep;
  }
}

function* generateNickRecursive(
  alphabet: string[],
  letters_replace: Record<string, string[]>,
  length: number,
  prefix = ""
): Generator<string> {
  if (length === 0) {
    yield prefix;
    return;
  }

  for (const letter of alphabet) {
    for (const variant of letterVariants(letter, letters_replace)) {
      yield* generateNickRecursive(
        alphabet,
        letters_replace,
        length - 1,
        prefix + variant
      );
    }
  }
}

function* generateAllNicks(config: Config): Generator<string> {
  for (let len = config.length.min; len <= config.length.max; len++) {
    yield* generateNickRecursive(config.alphabet, config.letters_replace, len);
  }
}

async function main() {
  const config = await loadConfig();
  const stream = createWriteStream("generated_nicks.txt", { flags: "w" });

  let count = 0;
  for (const nick of generateAllNicks(config)) {
    stream.write(nick + "\n");
    count++;
    if (count % 10000 === 0) console.log(`Generated ${count} nicknames...`);
  }

  stream.end();
  console.log(`Finished! Total nicknames generated: ${count}`);
}

main();

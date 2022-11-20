import path from 'node:path';
import { once } from 'node:events';
import * as fs from 'node:fs';
import { createInterface } from 'node:readline';

export interface CharOptions {
  char: string,
  isInclude: boolean,
  place: number,
  wrongPlaces: number[],
}

export interface WordFilter {
  charCount: number,
  charOptions?: CharOptions[],
}

export default class Singular {
  private data: string[] = [];

  public get length() : number {
    return this.data.length;
  }

  public read = async () => {
    try {
      const filePath = path.join(__dirname, 'singular.txt');
      const fileStream = fs.createReadStream(filePath);
      const rl = createInterface({ input: fileStream, crlfDelay: Infinity });
      rl.on('line', (line) => {
        // Filter the words only with unique chars
        // const chrSet = new Set(line);
        // if (chrSet.size < line.length) return
        this.data.push(line);
      });

      await once(rl, 'close');
    } catch (err) {
      throw new Error(err);
    }
  };

  public filter = async (filter: WordFilter): Promise<string[]> => {
    if (this.length === 0) {
      this.read();
    }

    const regExpIncluded = Singular.filterIncludedRegExp(filter);
    const regExpExcluded = Singular.filterExcludedRegExp(filter);

    return this.data.filter((word) => {
      // false if word length mismatch expected
      if (word.length !== filter.charCount) return false;

      // true if chars filter is absent
      if (!filter.charOptions) return true;

      // false if word contains excluded chars
      if (regExpExcluded && word.match(regExpExcluded) !== null) return false;

      // match chars that present in valid places
      let match = word.match(regExpIncluded) !== null;
      if (!match) return false;

      // match chars that will be present in other places
      match = filter.charOptions.reduce((prev, opt) => {
        if (opt.isInclude && opt.place === -1) {
          return prev && word.indexOf(opt.char) >= 0;
        }
        return prev;
      }, match);

      return match;
    });
  };

  static filterExcludedRegExp = (filter: WordFilter): RegExp | undefined => {
    if (filter.charOptions === undefined) {
      return undefined;
    }

    let excludedChars = '';

    filter.charOptions.forEach((charOptions) => {
      if (!charOptions.isInclude) {
        excludedChars += charOptions.char;
      }
    });

    if (excludedChars.length) {
      return new RegExp(`[${excludedChars}]`);
    }

    return undefined;
  };

  /**
   * Return the regexp for match the word with included chars
   *
   * @static
   * @param {WordFilter} filter
   * @memberof Singular
   */
  static filterIncludedRegExp = (filter: WordFilter): RegExp => {
    if (filter.charOptions === undefined) {
      return new RegExp(`^.{${filter.charCount}}$`);
    }

    const matches: { char?: string, exclude: string[] }[] = new Array(filter.charCount);
    for (let i = 0; i < matches.length; i += 1) {
      matches[i] = { char: undefined, exclude: [] };
    }

    filter.charOptions.forEach((charOptions) => {
      if (!charOptions.isInclude) return;

      if (charOptions.place >= 0) {
        matches[charOptions.place].char = charOptions.char;
        return;
      }

      if (charOptions.wrongPlaces.length) {
        charOptions.wrongPlaces.forEach((place) => {
          matches[place].exclude.push(charOptions.char);
        });
      }
    });

    const chars = matches.reduce((str, match) => {
      if (match.char) {
        return str + match.char;
      }

      if (match.exclude.length) {
        return `${str}[^${match.exclude.join('')}]`;
      }

      return `${str}.`;
    }, '');

    return new RegExp(`^${chars}$`);
  };
}

import Singular, { WordFilter } from '../Singular';

describe('Singular dictionary', () => {
  test('Read the dict', async () => {
    const dict = new Singular();
    await dict.read();

    expect(dict.length).toBeGreaterThan(100);
  });

  describe('Filter regexp', () => {
    test('only char count', () => {
      const filter: WordFilter = {
        charCount: 5,
      };

      const res = Singular.filterIncludedRegExp(filter);

      expect(res).toEqual(expect.any(RegExp));
      expect(res.source).toEqual('^.{5}$');
    });

    test('with exclude chars', () => {
      const filter: WordFilter = {
        charCount: 5,
        charOptions: [
          {
            char: 'а', isInclude: false, place: -1, wrongPlaces: [],
          },
        ],
      };

      const res = Singular.filterExcludedRegExp(filter);

      expect(res).toEqual(expect.any(RegExp));
      if (res !== undefined) {
        expect(res.source).toEqual('[а]');
      }
    });

    test('with exclude chars and char in place', () => {
      const filter: WordFilter = {
        charCount: 5,
        charOptions: [
          {
            char: 'а', isInclude: false, place: -1, wrongPlaces: [],
          },
          {
            char: 'б', isInclude: true, place: 1, wrongPlaces: [],
          },
        ],
      };

      let res;

      res = Singular.filterIncludedRegExp(filter);
      expect(res).toEqual(expect.any(RegExp));
      expect(res.source).toEqual('^.б...$');

      res = Singular.filterExcludedRegExp(filter);
      expect(res).toEqual(expect.any(RegExp));
      if (res !== undefined) {
        expect(res.source).toEqual('[а]');
      }
    });

    test('with exclude chars, char in place and char in wrong places', () => {
      const filter: WordFilter = {
        charCount: 5,
        charOptions: [
          {
            char: 'а', isInclude: false, place: -1, wrongPlaces: [],
          },
          {
            char: 'б', isInclude: true, place: 0, wrongPlaces: [],
          },
          {
            char: 'в', isInclude: true, place: -1, wrongPlaces: [2, 4],
          },
          {
            char: 'г', isInclude: true, place: -1, wrongPlaces: [2, 3],
          },
        ],
      };

      const res = Singular.filterIncludedRegExp(filter);

      expect(res).toEqual(expect.any(RegExp));
      expect(res.source).toEqual('^б.[^вг][^г][^в]$');
    });
  });

  describe('Filter the dict', () => {
    const dict = new Singular();

    beforeAll(async () => {
      await dict.read();
    });

    test('By real case', async () => {
      const res = await dict.filter({ charCount: 5 });

      expect(res.length).toBeGreaterThan(100);
    });

    test('By word count only', async () => {
      const filter: WordFilter = {
        charCount: 5,
        charOptions: [
          {
            char: 'г', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'е', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'й', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'ш', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'а', isInclude: true, place: 4, wrongPlaces: [],
          },
          {
            char: 'б', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'и', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'р', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'к', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'в', isInclude: true, place: -1, wrongPlaces: [0],
          },
          {
            char: 'о', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'л', isInclude: true, place: -1, wrongPlaces: [2],
          },
          {
            char: 'н', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
        ],
      };

      const res = await dict.filter(filter);

      expect(res).toHaveLength(3);
      expect(res).toEqual(expect.arrayContaining(['слава']));
    });

    test('By word count only', async () => {
      const filter: WordFilter = {
        charCount: 5,
        charOptions: [
          {
            char: 'в', isInclude: false, place: -1, wrongPlaces: [0],
          },
          {
            char: 'о', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'л', isInclude: false, place: -1, wrongPlaces: [2],
          },
          {
            char: 'н', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'а', isInclude: true, place: 4, wrongPlaces: [],
          },
          {
            char: 'г', isInclude: false, place: -1, wrongPlaces: [0],
          },
          {
            char: 'р', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'е', isInclude: true, place: 2, wrongPlaces: [],
          },
          {
            char: 'з', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'с', isInclude: false, place: -1, wrongPlaces: [0],
          },
          {
            char: 'х', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'м', isInclude: false, place: 2, wrongPlaces: [],
          },
        ],
      };

      const res = await dict.filter(filter);

      expect(res.length).toBeLessThanOrEqual(10);
      expect(res).not.toEqual(expect.arrayContaining(['волна']));
      expect(res).toEqual(expect.arrayContaining(['диета']));
    });

    test.only('By word count only 2', async () => {
      const filter: WordFilter = {
        charCount: 5,
        charOptions: [
          {
            char: 'ж', isInclude: true, place: 0, wrongPlaces: [0],
          },
          {
            char: 'и', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'з', isInclude: false, place: -1, wrongPlaces: [2],
          },
          {
            char: 'н', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'ь', isInclude: false, place: 4, wrongPlaces: [],
          },
          {
            char: 'е', isInclude: true, place: -1, wrongPlaces: [1],
          },
          {
            char: 'р', isInclude: false, place: -1, wrongPlaces: [2],
          },
          {
            char: 'л', isInclude: false, place: -1, wrongPlaces: [2, 3],
          },
          {
            char: 'о', isInclude: true, place: -1, wrongPlaces: [4],
          },
        ],
      };

      const res = await dict.filter(filter);

      expect(res.length).toBeLessThanOrEqual(10);
      expect(res).not.toEqual(expect.arrayContaining(['волна']));
      expect(res).toEqual(expect.arrayContaining(['диета']));
    });
  });
});

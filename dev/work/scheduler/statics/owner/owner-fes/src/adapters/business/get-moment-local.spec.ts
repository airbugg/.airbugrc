import { getMomentLocal, defaultLang } from './get-moment-local';

describe('getMomentLocal', () => {
  it('should map return the same lang', async () => {
    expect(getMomentLocal('en')).toBe('en');
  });
  it('should return the default lang for none supported lang', async () => {
    expect(getMomentLocal('asfasdf')).toBe(defaultLang);
  });
  it('should return "no" for "nb"', async () => {
    expect(getMomentLocal('no')).toBe('nb');
  });
  it('should return "zh" for "zh-hk"', async () => {
    expect(getMomentLocal('zh')).toBe('zh-hk');
  });
  it('should return "tl" for "tl-ph"', async () => {
    expect(getMomentLocal('tl')).toBe('tl-ph');
  });
});

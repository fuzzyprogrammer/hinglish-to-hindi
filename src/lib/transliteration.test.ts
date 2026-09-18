import { describe, it, expect } from 'vitest';
import { hinglishToHindi, hindiToHinglish } from './transliteration';

const fwd: Array<[string, string]> = [
  ['aap kaise hain', '\u0906\u092a \u0915\u0948\u0938\u0947 \u0939\u0948\u0902'],
  ['tum kya kar rahe ho', '\u0924\u0941\u092e \u0915\u094d\u092f\u093e \u0915\u0930 \u0930\u0939\u0947 \u0939\u094b'],
  ['namaste', '\u0928\u092e\u0938\u094d\u0924\u0947'],
  ['dil', '\u0926\u093f\u0932'],
  ['bahut sundar', '\u092c\u0939\u0941\u0924 \u0938\u0941\u0928\u094d\u0926\u0930'],
  ['kaun ho tum', '\u0915\u094c\u0928 \u0939\u094b \u0924\u0941\u092e'],
  ['mujhe aana hai', '\u092e\u0941\u091d\u0947 \u0906\u0928\u093e \u0939\u0948'],
  ['main theek hoon', '\u092e\u0948\u0902 \u0920\u0940\u0915 \u0939\u0942\u0901'],
  ['yeh kaam karo', '\u092f\u0939 \u0915\u093e\u092e \u0915\u0930\u094b'],
  ['kyun', '\u0915\u094d\u092f\u094b\u0902'],
  ['mera ghar hai', '\u092e\u0947\u0930\u093e \u0918\u0930 \u0939\u0948'],
  ['sab kuch thik hai', '\u0938\u092c \u0915\u0941\u091b \u0920\u0940\u0915 \u0939\u0948'],
];

const rev: Array<[string, string]> = [
  ['\u0906\u092a \u0915\u0948\u0938\u0947 \u0939\u0948\u0902', 'aap kaise hain'],
  ['\u0924\u0941\u092e \u0915\u094d\u092f\u093e \u0915\u0930 \u0930\u0939\u0947 \u0939\u094b', 'tum kya kar rahe ho'],
  ['\u0928\u092e\u0938\u094d\u0924\u0947', 'namaste'],
  ['\u0926\u093f\u0932', 'dil'],
  ['\u0939\u093f\u0928\u094d\u0926\u0940', 'hindi'],
  ['\u092e\u0947\u0930\u0940 \u092e\u092e\u094d\u092e\u0940', 'meri mammi'],
  ['\u0915\u094d\u092f\u094b\u0902', 'kyon'],
  ['\u092a\u094d\u0930\u0947\u092e', 'prem'],
  ['\u0928\u0939\u0940\u0902', 'nahin'],
  ['\u092e\u0948\u0902', 'main'],
  ['\u0915\u0939\u093e\u0901', 'kahan'],
  ['\u092f\u0939', 'yeh'],
  ['\u0935\u0939', 'woh'],
  ['\u0939\u0942\u0901', 'hoon'],
  ['\u0936\u094d\u0930\u0940 \u0917\u0923\u0947\u0936', 'shri gaNesh'],
];

describe('hinglishToHindi', () => {
  it.each(fwd)('converts %s', (inp, exp) => {
    expect(hinglishToHindi(inp)).toBe(exp);
  });
});

describe('hindiToHinglish', () => {
  it.each(rev)('romanizes %s', (inp, exp) => {
    expect(hindiToHinglish(inp)).toBe(exp);
  });
});

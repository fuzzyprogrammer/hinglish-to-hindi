import { describe, it, expect } from 'vitest';
import { hinglishToHindi, hindiToHinglish } from './transliteration';

const fwd: Array<[string, string]> = [
  ['aap kaise hain', 'आप कैसे हें'],
  ['tum kya kar rahe ho', 'तुम क्या कर रहे हो'],
  ['namaste', 'नमस्ते'],
  ['dil', 'दिल'],
  ['bahut sundar', 'बहुत सुन्दर'],
  ['kaun ho tum', 'कौन हो तुम'],
  ['mujhe aana hai', 'मुझे आना हें'],
  ['main theek hoon', 'मैं ठीक हूँ'],
  ['yeh kaam karo', 'यह काम करो'],
  ['kyun', 'क्यों'],
  ['mera ghar hai', 'मेरा घर हें'],
  ['sab kuch thik hai', 'सब कुछ ठीक हें'],
];

const rev: Array<[string, string]> = [
  ['आप कैसे हें', 'aap kaise hain'],
  ['तुम क्या कर रहे हो', 'tum kya kar rahe ho'],
  ['नमस्ते', 'namaste'],
  ['दिल', 'dil'],
  ['हिंदी', 'hindi'],
  ['मेरी मम्मी', 'meri mammi'],
  ['क्यों', 'kyon'],
  ['प्रेम', 'prem'],
  ['नहीं', 'nahin'],
  ['मैं', 'main'],
  ['कहाँ', 'kahan'],
  ['यह', 'yeh'],
  ['वह', 'woh'],
  ['हूँ', 'hoon'],
  ['श्री गणेश', 'shri gaNesh'],
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
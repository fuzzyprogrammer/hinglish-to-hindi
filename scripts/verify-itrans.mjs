import Sanscript from '@indic-transliteration/sanscript';

const cases = ['aap kaise hain', 'kya', 'dil', 'kyoM', 'hiMdI', 'haiM'];
for (const c of cases) {
  console.log(c, '=>', Sanscript.t(c, 'itrans', 'devanagari'));
  console.log(c, '=>', Sanscript.t(c, 'devanagari', 'itrans'));
}
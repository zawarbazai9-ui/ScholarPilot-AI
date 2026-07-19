declare module 'pdfjs-dist' {
  const pdfjsLib: typeof import('pdfjs-dist/types/src/display/api');
  export = pdfjsLib;
}

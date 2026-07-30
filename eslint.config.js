// eslint.config.js
// Configurazione ESLint in formato "flat config" (ESLint 9+).
//
// ATTENZIONE: questa configurazione non è stata eseguita/verificata in
// questa sessione — l'ambiente in cui è stata scritta non ha accesso di
// rete per installare ESLint. Prima di affidarti a `npm run lint` in
// CI, verifica in locale con:
//   npm install eslint --save-dev
//   npx eslint .
// e aggiusta le regole che risultano troppo rigide o troppo permissive
// per il tuo gusto.
"use strict";

module.exports = [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2019,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        URL: "readonly",
        Blob: "readonly",
        Image: "readonly",
        module: "writable",
        self: "readonly",
        requestAnimationFrame: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      // Il codice è scritto in stile ES5 (var, function) di proposito,
      // per restare leggibile senza build step: non forziamo let/const/arrow.
      "no-var": "off",
      eqeqeq: ["warn", "smart"]
    }
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        process: "readonly",
        __dirname: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn"
    }
  }
];

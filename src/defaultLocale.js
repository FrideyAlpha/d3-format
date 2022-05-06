import formatLocale from "./locale.js";

var locale;
export var format;
export var formatCurrencyPrefix;
export var formatPrefix;

defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

export default function defaultLocale(definition) {
  locale = formatLocale(definition);
  format = locale.format;
  formatCurrencyPrefix = locale.formatCurrencyPrefix;
  formatPrefix = locale.formatPrefix;
  return locale;
}

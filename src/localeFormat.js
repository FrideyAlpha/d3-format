import btod from "./btod";
import formatDefault from "./formatDefault";
import formatGroup from "./formatGroup";
import formatRounded from "./formatRounded";
import formatRoundedPercentage from "./formatRoundedPercentage";
import formatSystem from "./formatSystem";

// [[fill]align][sign][symbol][0][width][,][.precision][type]
var formatRe = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;

var formatTypes = {
  "b": function(x) { return x.toString(2); },
  "c": function(x) { return String.fromCharCode(x); },
  "o": function(x) { return x.toString(8); },
  "x": function(x) { return x.toString(16); },
  "X": function(x) { return x.toString(16).toUpperCase(); },
  "g": function(x, p) { return x.toPrecision(p); },
  "e": function(x, p) { return x.toExponential(p); },
  "f": function(x, p) { return x.toFixed(p); },
  "%": function(x, p) { return (x * 100).toFixed(p); },
  "p": formatRoundedPercentage,
  "r": formatRounded,
  "s": formatSystem
};

function identity(x) {
  return x;
}

export default function(locale) {
  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity,
      currency = locale.currency,
      decimal = locale.decimal;

  return function(specifier) {
    var match = formatRe.exec(specifier),
        fill = match[1] || " ",
        align = match[2] || ">",
        sign = match[3] || "-",
        symbol = match[4] || "",
        zero = match[5],
        width = +match[6],
        comma = match[7],
        precision = match[8],
        type = match[9];

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = fill = "0", align = "=";

    // Compute the fixed prefix and suffix.
    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

    // Is this an integer type? Can this type generate exponential notation?
    var integer = type && /[boxXcd]/.test(type),
        exponent = !type || !/[boxXcf%p]/.test(type);

    // Clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    if (precision) {
      precision = +precision.substring(1);
      precision = /[gprs]/.test(type)
          ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));
    }

    type = formatTypes[type] || formatDefault;

    return function(value) {
      value = +value;

      // Return the empty string for floats formatted as ints.
      if (integer && (value % 1)) return "";

      // Convert negative to positive, and record the sign prefix.
      // Note that -0 is not less than 0, but 1 / -0 is!
      var valueSign = value < 0 || 1 / value < 0 ? (value *= -1, "-")
          : sign === "-" ? ""
          : sign;

      // Convert to the desired precision.
      value = type(value, precision);

      // Break the value into the integer part (before) and decimal part (after).
      var i = value.lastIndexOf("."),
          before,
          after;

      // If there is no decimal, break on "e" where appropriate.
      if (i < 0) {
        var j = exponent ? value.lastIndexOf("e") : -1;
        if (j < 0) before = value, after = suffix;
        else before = value.substring(0, j), after = value.substring(j) + suffix;
      } else {
        before = value.substring(0, i);
        after = decimal + value.substring(i + 1) + suffix;
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (!zero && comma) before = group(before, Infinity);

      var length = (zero && comma ? 0 : valueSign.length) + prefix.length + before.length + after.length,
          padding = length < width ? new Array(length = width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (zero && comma) before = group(padding + before, padding.length ? width - after.length : Infinity);

      // Apply prefix.
      valueSign += prefix;

      // Rejoin integer and decimal parts.
      value = before + after;

      return align === "<" ? valueSign + value + padding
          : align === ">" ? padding + valueSign + value
          : align === "^" ? padding.substring(0, length >>= 1) + valueSign + value + padding.substring(length)
          : valueSign + (zero && comma ? value : padding + value);
    };
  };
};
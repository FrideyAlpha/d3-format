# d3-format

Ever noticed how sometimes JavaScript doesn’t display numbers the way you expect? Like, you tried to print tenths with a simple loop:

```js
for (let i = 0; i < 10; ++i) {
  console.log(0.1 * i);
}
```

And you got this:

```js
0
0.1
0.2
0.30000000000000004
0.4
0.5
0.6000000000000001
0.7000000000000001
0.8
0.9
```

Welcome to [binary floating point](https://en.wikipedia.org/wiki/Double-precision_floating-point_format)! ಠ_ಠ

Yet rounding error is not the only reason to customize number formatting. A table of numbers should be formatted consistently for comparison; above, 0.0 would be better than 0. Large numbers should have grouped digits (e.g., 42,000) or be in scientific or metric notation (4.2e+4, 42k). Currencies should have fixed precision ($3.50). Reported numerical results should be rounded to significant digits (4021 becomes 4000). Number formats should appropriate to the reader’s locale (42.000,00 or 42,000.00). The list goes on.

Formatting numbers for human consumption is the purpose of d3-format, which is modeled after Python 3’s [format specification mini-language](https://docs.python.org/3/library/string.html#format-specification-mini-language) ([PEP 3101](https://www.python.org/dev/peps/pep-3101/)). Revisiting the example above:

```js
const f = d3.format(".1f");
for (let i = 0; i < 10; ++i) {
  console.log(f(0.1 * i));
}
```

Now you get this:

```js
0.0
0.1
0.2
0.3
0.4
0.5
0.6
0.7
0.8
0.9
```

But d3-format is much more than an alias for [number.toFixed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)! A few more examples:

```js
d3.format(".0%")(0.123);  // rounded percentage, "12%"
d3.format("($.2f")(-3.5); // localized fixed-point currency, "(£3.50)"
d3.format("+20")(42);     // space-filled and signed, "                 +42"
d3.format(".^20")(42);    // dot-filled and centered, ".........42........."
d3.format(".2s")(42e6);   // SI-prefix with two significant digits, "42M"
d3.format("#x")(48879);   // prefixed lowercase hexadecimal, "0xbeef"
d3.format(",.2r")(4223);  // grouped thousands with two significant digits, "4,200"
```

See [*locale*.format](#locale_format) for a detailed specification, and try running [d3.formatSpecifier](#formatSpecifier) on the above formats to decode their meaning.

## Installing

If you use npm, `npm install d3-format`. You can also download the [latest release on GitHub](https://github.com/d3/d3-format/releases/latest). In modern browsers, you can import d3-format from Skypack:

```html
<script type="module">

import {format} from "https://cdn.skypack.dev/d3-format@3";

const f = format(".2s");

</script>
```

For legacy environments, you can load d3-format’s UMD bundle from an npm-based CDN such as jsDelivr; a `d3` global is exported:

```html
<script src="https://cdn.jsdelivr.net/npm/d3-format@3"></script>
<script>

var f = d3.format(".2s");

</script>
```

Locale files are published to npm and can be loaded using [d3.json](https://github.com/d3/d3-fetch/blob/master/README.md#json). For example, to set Russian as the default locale:

```js
const locale = await d3.json("https://cdn.jsdelivr.net/npm/d3-format@3/locale/ru-RU.json");
d3.formatDefaultLocale(locale);
const f = d3.format("$,");
console.log(f(1234.56)); // 1 234,56 руб.
```

[Try d3-format in your browser.](https://observablehq.com/@d3/d3-format)

## API Reference

<a name="format" href="#format">#</a> d3.<b>format</b>(<i>specifier</i>) [<>](https://github.com/d3/d3-format/blob/main/src/defaultLocale.js#L4 "Source")

An alias for [*locale*.format](#locale_format) on the [default locale](#formatDefaultLocale).

<a name="formatPrefix" href="#formatPrefix">#</a> d3.<b>formatPrefix</b>(<i>specifier</i>, <i>value</i>) [<>](https://github.com/d3/d3-format/blob/main/src/defaultLocale.js#L5 "Source")

An alias for [*locale*.formatPrefix](#locale_formatPrefix) on the [default locale](#formatDefaultLocale).

<a name="locale_format" href="#locale_format">#</a> <i>locale</i>.<b>format</b>(<i>specifier</i>) [<>](https://github.com/d3/d3-format/blob/main/src/locale.js#L18 "Source")

Returns a new format function for the given string *specifier*. The returned function takes a number as the only argument, and returns a string representing the formatted number. The general form of a specifier is:

```
[​[fill]align][sign][symbol][0][width][,][.precision][~][type]
```

The *fill* can be any character. The presence of a fill character is signaled by the *align* character following it, which must be one of the following:

* `>` - Forces the field to be right-aligned within the available space. (Default behavior).
* `<` - Forces the field to be left-aligned within the available space.
* `^` - Forces the field to be centered within the available space.
* `=` - like `>`, but with any sign and symbol to the left of any padding.

The *sign* can be:

* `-` - nothing for zero or positive and a minus sign for negative. (Default behavior.)
* `+` - a plus sign for zero or positive and a minus sign for negative.
* `(` - nothing for zero or positive and parentheses for negative.
* ` ` (space) - a space for zero or positive and a minus sign for negative.

The *symbol* can be:

* `$` - apply currency symbols per the locale definition.
* `#` - for binary, octal, or hexadecimal notation, prefix by `0b`, `0o`, or `0x`, respectively.

The *zero* (`0`) option enables zero-padding; this implicitly sets *fill* to `0` and *align* to `=`. The *width* defines the minimum field width; if not specified, then the width will be determined by the content. The *comma* (`,`) option enables the use of a group separator, such as a comma for thousands.

Depending on the *type*, the *precision* either indicates the number of digits that follow the decimal point (types `f` and `%`), or the number of significant digits (types `​`, `e`, `g`, `K`, `r`, `s` and `p`). If the precision is not specified, it defaults to 6 for all types except `​` (none), which defaults to 12. Precision is ignored for integer formats (types `b`, `o`, `d`, `x`, `X` and `c`). See [precisionFixed](#precisionFixed) and [precisionRound](#precisionRound) for help picking an appropriate precision.

The `~` option trims insignificant trailing zeros across all format types. This is most commonly used in conjunction with types `r`, `e`, `s`, `K` and `%`. For example:

```js
d3.format("s")(1500);  // "1.50000k"
d3.format("~s")(1500); // "1.5k"
```

The available *type* values are:

* `e` - exponent notation.
* `f` - fixed point notation.
* `g` - either decimal or exponent notation, rounded to significant digits.
* `r` - decimal notation, rounded to significant digits.
* `s` - decimal notation with an [SI prefix](#locale_formatPrefix), rounded to significant digits.
* `K` - decimal notation with an [currency prefix](#locale_formatCurrencyPrefix), rounded to significant digits.
* `%` - multiply by 100, and then decimal notation with a percent sign.
* `p` - multiply by 100, round to significant digits, and then decimal notation with a percent sign.
* `b` - binary notation, rounded to integer.
* `o` - octal notation, rounded to integer.
* `d` - decimal notation, rounded to integer.
* `x` - hexadecimal notation, using lower-case letters, rounded to integer.
* `X` - hexadecimal notation, using upper-case letters, rounded to integer.
* `c` - character data, for a string of text.

The type `​` (none) is also supported as shorthand for `~g` (with a default precision of 12 instead of 6), and the type `n` is shorthand for `,g`. For the `g`, `n` and `​` (none) types, decimal notation is used if the resulting string would have *precision* or fewer digits; otherwise, exponent notation is used. For example:

```js
d3.format(".2")(42);  // "42"
d3.format(".2")(4.2); // "4.2"
d3.format(".1")(42);  // "4e+1"
d3.format(".1")(4.2); // "4"
```

<a name="locale_formatPrefix" href="#locale_formatPrefix">#</a> <i>locale</i>.<b>formatPrefix</b>(<i>specifier</i>, <i>value</i>) [<>](https://github.com/d3/d3-format/blob/master/src/locale.js#L152 "Source")

Equivalent to [*locale*.format](#locale_format), except the returned function will convert values to the units of the appropriate [SI prefix](https://en.wikipedia.org/wiki/Metric_prefix#List_of_SI_prefixes) for the specified numeric reference *value* before formatting in fixed point notation. The following prefixes are supported:

* `y` - yocto, 10⁻²⁴
* `z` - zepto, 10⁻²¹
* `a` - atto, 10⁻¹⁸
* `f` - femto, 10⁻¹⁵
* `p` - pico, 10⁻¹²
* `n` - nano, 10⁻⁹
* `µ` - micro, 10⁻⁶
* `m` - milli, 10⁻³
* `​` (none) - 10⁰
* `k` - kilo, 10³
* `M` - mega, 10⁶
* `G` - giga, 10⁹
* `T` - tera, 10¹²
* `P` - peta, 10¹⁵
* `E` - exa, 10¹⁸
* `Z` - zetta, 10²¹
* `Y` - yotta, 10²⁴

Unlike [*locale*.format](#locale_format) with the `s` format type, this method returns a formatter with a consistent SI prefix, rather than computing the prefix dynamically for each number. In addition, the *precision* for the given *specifier* represents the number of digits past the decimal point (as with `f` fixed point notation), not the number of significant digits. For example:

```js
const f = d3.formatPrefix(",.0", 1e-6);
f(0.00042); // "420µ"
f(0.0042); // "4,200µ"
```

This method is useful when formatting multiple numbers in the same units for easy comparison. See [precisionPrefix](#precisionPrefix) for help picking an appropriate precision, and [bl.ocks.org/9764126](http://bl.ocks.org/mbostock/9764126) for an example.

<a name="locale_formatCurrencyPrefix" href="#locale_formatCurrencyPrefix">#</a> <i>locale</i>.<b>formatCurrencyPrefix</b>(<i>specifier</i>, <i>value</i>) [<>](https://github.com/d3/d3-format/blob/master/src/locale.js#L153 "Source")

Equivalent to [*locale*.locale_formatPrefix](#locale_formatPrefix), except it uses common currency abbreviations:

* `​` (none) - 10⁰
* `K` - thousands, 10³
* `M` - millions, 10⁶
* `B` - billions, 10⁹
* `T` - trillions, 10¹²

<a name="formatSpecifier" href="#formatSpecifier">#</a> d3.<b>formatSpecifier</b>(<i>specifier</i>) [<>](https://github.com/d3/d3-format/blob/master/src/formatSpecifier.js "Source")

Parses the specified *specifier*, returning an object with exposed fields that correspond to the [format specification mini-language](#locale_format) and a toString method that reconstructs the specifier. For example, `formatSpecifier("s")` returns:

```js
FormatSpecifier {
  "fill": " ",
  "align": ">",
  "sign": "-",
  "symbol": "",
  "zero": false,
  "width": undefined,
  "comma": false,
  "precision": undefined,
  "trim": false,
  "type": "s"
}
```

This method is useful for understanding how format specifiers are parsed and for deriving new specifiers. For example, you might compute an appropriate precision based on the numbers you want to format using [precisionFixed](#precisionFixed) and then create a new format:

```js
const s = d3.formatSpecifier("f");
s.precision = d3.precisionFixed(0.01);
const f = d3.format(s);
f(42); // "42.00";
```

<a name="FormatSpecifier" href="#FormatSpecifier">#</a> new d3.<b>FormatSpecifier</b>(<i>specifier</i>) [<>](https://github.com/d3/d3-format/blob/main/src/formatSpecifier.js "Source")

Given the specified *specifier* object, returning an object with exposed fields that correspond to the [format specification mini-language](#locale_format) and a toString method that reconstructs the specifier. For example, `new FormatSpecifier({type: "s"})` returns:

```js
FormatSpecifier {
  "fill": " ",
  "align": ">",
  "sign": "-",
  "symbol": "",
  "zero": false,
  "width": undefined,
  "comma": false,
  "precision": undefined,
  "trim": false,
  "type": "s"
}
```

<a name="precisionFixed" href="#precisionFixed">#</a> d3.<b>precisionFixed</b>(<i>step</i>) [<>](https://github.com/d3/d3-format/blob/main/src/precisionFixed.js "Source")

Returns a suggested decimal precision for fixed point notation given the specified numeric *step* value. The *step* represents the minimum absolute difference between values that will be formatted. (This assumes that the values to be formatted are also multiples of *step*.) For example, given the numbers 1, 1.5, and 2, the *step* should be 0.5 and the suggested precision is 1:

```js
const p = d3.precisionFixed(0.5);
const f = d3.format("." + p + "f");
f(1);   // "1.0"
f(1.5); // "1.5"
f(2);   // "2.0"
```

Whereas for the numbers 1, 2 and 3, the *step* should be 1 and the suggested precision is 0:

```js
const p = d3.precisionFixed(1);
const f = d3.format("." + p + "f");
f(1); // "1"
f(2); // "2"
f(3); // "3"
```

Note: for the `%` format type, subtract two:

```js
const p = Math.max(0, d3.precisionFixed(0.05) - 2);
const f = d3.format("." + p + "%");
f(0.45); // "45%"
f(0.50); // "50%"
f(0.55); // "55%"
```

<a name="precisionPrefix" href="#precisionPrefix">#</a> d3.<b>precisionPrefix</b>(<i>step</i>, <i>value</i>) [<>](https://github.com/d3/d3-format/blob/main/src/precisionPrefix.js "Source")

Returns a suggested decimal precision for use with [*locale*.formatPrefix](#locale_formatPrefix) given the specified numeric *step* and reference *value*. The *step* represents the minimum absolute difference between values that will be formatted, and *value* determines which SI prefix will be used. (This assumes that the values to be formatted are also multiples of *step*.) For example, given the numbers 1.1e6, 1.2e6, and 1.3e6, the *step* should be 1e5, the *value* could be 1.3e6, and the suggested precision is 1:

```js
const p = d3.precisionPrefix(1e5, 1.3e6);
const f = d3.formatPrefix("." + p, 1.3e6);
f(1.1e6); // "1.1M"
f(1.2e6); // "1.2M"
f(1.3e6); // "1.3M"
```

<a name="currencyPrecisionPrefix" href="#currencyPrecisionPrefix">#</a> d3.<b>currencyPrecisionPrefix</b>(<i>step</i>, <i>value</i>) [<>](https://github.com/d3/d3-format/blob/master/src/currencyPrecisionPrefix.js "Source")

Returns a suggested decimal precision for use with [*locale*.formatCurrencyPrefix](#locale_formatCurrencyPrefix) given the specified numeric *step* and reference *value*. This is the equivalent of [*locale*.precisionPrefix](#locale_precisionPrefix) using common currency abbreviations instead of SI prefixes.

<a name="precisionRound" href="#precisionRound">#</a> d3.<b>precisionRound</b>(<i>step</i>, <i>max</i>) [<>](https://github.com/d3/d3-format/blob/master/src/precisionRound.js "Source")

Returns a suggested decimal precision for format types that round to significant digits given the specified numeric *step* and *max* values. The *step* represents the minimum absolute difference between values that will be formatted, and the *max* represents the largest absolute value that will be formatted. (This assumes that the values to be formatted are also multiples of *step*.) For example, given the numbers 0.99, 1.0, and 1.01, the *step* should be 0.01, the *max* should be 1.01, and the suggested precision is 3:

```js
const p = d3.precisionRound(0.01, 1.01);
const f = d3.format("." + p + "r");
f(0.99); // "0.990"
f(1.0);  // "1.00"
f(1.01); // "1.01"
```

Whereas for the numbers 0.9, 1.0, and 1.1, the *step* should be 0.1, the *max* should be 1.1, and the suggested precision is 2:

```js
const p = d3.precisionRound(0.1, 1.1);
const f = d3.format("." + p + "r");
f(0.9); // "0.90"
f(1.0); // "1.0"
f(1.1); // "1.1"
```

Note: for the `e` format type, subtract one:

```js
const p = Math.max(0, d3.precisionRound(0.01, 1.01) - 1);
const f = d3.format("." + p + "e");
f(0.01); // "1.00e-2"
f(1.01); // "1.01e+0"
```

### Locales

<a name="formatLocale" href="#formatLocale">#</a> d3.<b>formatLocale</b>(<i>definition</i>) [<>](https://github.com/d3/d3-format/blob/main/src/locale.js "Source")

Returns a *locale* object for the specified *definition* with [*locale*.format](#locale_format) and [*locale*.formatPrefix](#locale_formatPrefix) methods. The *definition* must include the following properties:

* `decimal` - the decimal point (e.g., `"."`).
* `thousands` - the group separator (e.g., `","`).
* `grouping` - the array of group sizes (e.g., `[3]`), cycled as needed.
* `currency` - the currency prefix and suffix (e.g., `["$", ""]`).
* `currencyAbbreviations` - the list of abbreviated suffixes for currency values; an array of elements for each: units, thousands, millions, billions and trillions; defaults to `["", "K", "M", "B", "T"]`. The number of elements can vary.
* `numerals` - optional; an array of ten strings to replace the numerals 0-9.
* `percent` - optional; the percent sign (defaults to `"%"`).
* `minus` - optional; the minus sign (defaults to `"−"`).
* `nan` - optional; the not-a-number value (defaults `"NaN"`).

Note that the *thousands* property is a misnomer, as the grouping definition allows groups other than thousands.

<a name="formatDefaultLocale" href="#formatDefaultLocale">#</a> d3.<b>formatDefaultLocale</b>(<i>definition</i>) [<>](https://github.com/d3/d3-format/blob/main/src/defaultLocale.js "Source")

Equivalent to [d3.formatLocale](#formatLocale), except it also redefines [d3.format](#format) and [d3.formatPrefix](#formatPrefix) to the new locale’s [*locale*.format](#locale_format) and [*locale*.formatPrefix](#locale_formatPrefix). If you do not set a default locale, it defaults to [U.S. English](https://github.com/d3/d3-format/blob/main/locale/en-US.json).

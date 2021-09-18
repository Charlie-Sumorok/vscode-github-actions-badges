type Type1 = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
type Type2 = '0' | '1' | '2' | '3' | '4' | '5';

type Type3 = `${Type1}-${Type2}`;

//#region Hex
type HexDigit =
	| '0'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f';

type FourDigitHex = `0x${HexDigit}${HexDigit}${HexDigit}${HexDigit}`;

//#endregion

type LimitEach = '0';
type Limit =
	`0x${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}${LimitEach}`;

// 16 ** 4 <= x <= 16 ** 5
// 9 ** 5 <= x <= 10 ** 5
// 6 ** 6 <= x <= 7 ** 6
// 5 ** 7 <= x <= 6 ** 7
// 4 ** 8 <= x <= 5 ** 8
// 3 ** 9 <= x <= 4 ** 9
// 3 ** 10 <= x <= 4 ** 10
// 2 ** 11 <= x <= 3 ** 11
// 2 ** 12 <= x <= 3 ** 12
// 2 ** 13 <= x <= 3 ** 13
// 2 ** 14 <= x <= 3 ** 14
// 2 ** 15 <= x <= 3 ** 15
// 2 ** 16 <= x <= 3 ** 16
// 1 ** 17 <= x <= 2 ** 17
10011000100101101;
11000011010100000;

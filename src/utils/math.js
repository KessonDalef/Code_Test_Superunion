const QUARTER_PI = Math.PI * 0.25;
const HALF_PI = Math.PI * 0.5;
const PI = Math.PI;
const TWO_PI = Math.PI*2;

const lerp = function(start, stop, amt) {
    return amt * (stop - start) + start;
};

const map = function (n, start1, stop1, start2, stop2) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
};

export { QUARTER_PI, HALF_PI, PI, TWO_PI, lerp, map };
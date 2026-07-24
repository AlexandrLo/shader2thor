// Warps `s` with two frequency-mismatched pseudo-rotations and returns a
// scalar field used both as the raymarch step and as a color term.
float field(inout vec3 s, float t, float r) {
    vec4 freq = vec4(0., 33., 55., 0.);
    s.xz *= mat2(cos(freq + t * .4));
    s.xy *= mat2(cos(freq + t * .2));
    return length(s + sin(t * .6))
         * log(length(s) + 1.)
         + sin(sin(sin(s += s + t * .8).y + s).z + s).x * .5 - 1. - r;
}

// Interleaved Gradient Noise (Jorge Jimenez, CoD:AW) remapped to a triangular
// distribution, used to dither the final color and mask banding.
float ditherNoise( in vec2 fragCoord )
{
    float noise = fract(52.9829189 * fract(dot(fragCoord, vec2(0.06711056, 0.00583715))));
    return noise - 0.5;
}

void mainImage(out vec4 o, vec2 u) {
    vec3 p, s, O, R = iResolution;
    float t = iTime, d = 2.5, r;

    // R.z (iResolution's unused pixel-aspect component) doubles as the loop counter.
    while (R.z++ < 7.) {
        s = p = vec3((u - .5 * R.xy) / R.y * d, 5. - d);
        d += min(r += field(s, t, r), 1.);
        s = p + .1;

        O = max(O + .7 - r * .28, O)
          * (vec3(.1, .3, .4) - vec3(10, 5, 6) * field(s, t, r) / 4.);
        o.xyz = O;
    }

    // Dither to hide banding
    o.xyz += ditherNoise(u) / 64.0;
}

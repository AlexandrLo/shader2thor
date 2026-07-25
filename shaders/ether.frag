uniform int uTheme;

// ---- theme-dependent parameters (filled at runtime by initTheme) ----------
// `tint` is the ambient color the ether fades to, `bands` scales the field into
// each channel and so decides the hue of the bright filaments.
vec3 tint;
vec3 bands;

void initTheme()
{
    int t = clamp(uTheme, 1, 5);
    if (t == 1) {          // abyss — the original blue/teal look
        tint  = vec3(.1, .3, .4);
        bands = vec3(10., 5., 6.);
    } else if (t == 2) {   // ember — warm orange filaments over a rust haze
        tint  = vec3(.4, .22, .1);
        bands = vec3(6., 8., 11.);
    } else if (t == 3) {   // verdant — green ether with a cold undertone
        tint  = vec3(.12, .38, .22);
        bands = vec3(9., 5., 10.);
    } else if (t == 4) {   // orchid — violet and magenta
        tint  = vec3(.32, .12, .42);
        bands = vec3(7., 11., 6.);
    } else {               // solar — gold shading into deep amber
        tint  = vec3(.42, .32, .08);
        bands = vec3(6., 7., 12.);
    }
}

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
    initTheme();

    vec3 p, s, O, R = iResolution;
    float t = iTime, d = 2.5, r;

    // R.z (iResolution's unused pixel-aspect component) doubles as the loop counter.
    while (R.z++ < 7.) {
        s = p = vec3((u - .5 * R.xy) / R.y * d, 5. - d);
        d += min(r += field(s, t, r), 1.);
        s = p + .1;

        O = max(O + .7 - r * .28, O)
          * (tint - bands * field(s, t, r) / 4.);
        o.xyz = O;
    }

    // Dither to hide banding
    o.xyz += ditherNoise(u) / 64.0;
}

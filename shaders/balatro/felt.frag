#define PIXEL_SIZE_FAC 700.0
#define SPIN_EASE 0.5
#define colour_1 vec4(86./255.,168./255.,135./255.,1.0)*vec4(0.75)
#define colour_2 vec4(75./255.,194./255.,146./255.,1.0)
#define colour_3 vec4(0.0,0.0,0.0,1.0)
#define contrast 1.0
#define spin_amount 0.0
#define spin_time (iTime*spin_amount)

// ---- loop period ---------------------------------------------------------
// All iTime-dependent terms below are tuned to exact harmonics of ANIM_OMEGA
// so the whole frame repeats exactly every ANIM_PERIOD seconds.
#define ANIM_PERIOD 26.0
#define ANIM_OMEGA (6.283185307179586/ANIM_PERIOD)
#define SWIRL_FREQ (ANIM_OMEGA*0.5)

// ---- particle settings -------------------------------------------------
#define P_DENSITY   2.0    // cells across screen height (lower = fewer, bigger spacing)
#define P_SPEED     0.01  // upward drift speed
#define P_GLOW      0.015  // glow radius
#define P_CORE      0.010  // solid core radius
#define P_BRIGHT    0.50   // overall intensity
#define P_PIXELATE  1      // 1 = snap to the pixel_size grid, 0 = smooth

// ---- CRT settings ------------------------------------------------------
#define SCAN_PITCH    3.0   // pixels per scanline
#define SCAN_STRENGTH 0.20  // 0 = off, 1 = brutal
#define SCAN_ROLL     0.0   // try 0.3 for a slow rolling bar
#define MASK_STRENGTH 0.15  // RGB aperture grille
#define CRT_VIGNETTE  0.35
// ------------------------------------------------------------------------

float hash21(vec2 p){
    p = fract(p*vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x*p.y);
}

// Snaps a wobble frequency to the nearest harmonic of ANIM_OMEGA so any
// sin/cos(t*quantizeFreq(f)) term is exactly periodic with period ANIM_PERIOD.
float quantizeFreq(float f){
    return max(1.0, floor(f/ANIM_OMEGA + 0.5))*ANIM_OMEGA;
}

float particleLayer(vec2 uv, float t, float seed){
    uv += seed*17.31;
    float driftMult = 0.6 + 0.4*fract(seed);
    float driftAmp = P_SPEED*driftMult/ANIM_OMEGA;
    uv.y -= driftAmp*sin(ANIM_OMEGA*t);
    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    float acc = 0.0;
    for(int y = -1; y <= 1; y++){
        for(int x = -1; x <= 1; x++){
            vec2 o  = vec2(float(x), float(y));
            float n  = hash21(id + o + seed);
            float n2 = fract(n*93.17);
            float n3 = fract(n*31.41);
            vec2 p = (vec2(n, n2) - 0.5)*0.75;
            p.x += 0.12*sin(t*quantizeFreq(0.25 + 0.45*n3) + n *6.2831);
            p.y += 0.10*cos(t*quantizeFreq(0.20 + 0.35*n2) + n2*6.2831);
            float d = length(gv - o - p);
            float sz = mix(0.5, 1.6, n3);
            float twinkle = 0.55 + 0.45*sin(t*quantizeFreq(0.8 + 1.8*n2) + n*6.2831);
            float glow = (P_GLOW*sz)/max(d, 1e-4);              // halo
            float core = smoothstep(P_CORE*sz, P_CORE*sz*0.3, d)*2.0; // solid dot
            acc += (glow + core)*twinkle*step(0.35, n3);
        }
    }
    return acc;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //Convert to UV coords (0-1) and floor for pixel effect
    float pixel_size = 3.0;
    vec2 uv = (floor((fragCoord.xy)*(1./pixel_size))*pixel_size - 0.5*iResolution.xy)/length(iResolution.xy);
	uv *= 1.3;
    float uv_len = length(uv);

    //Adding in a center swirl, changes with time. Only applies meaningfully if the 'spin amount' is a non-zero number
    float speed = (spin_time*SPIN_EASE*0.2) + 302.2;
    float new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE*20.*(1.*spin_amount*uv_len + (1. - 1.*spin_amount));
    uv = vec2(uv_len * cos(new_pixel_angle), uv_len * sin(new_pixel_angle));

	//Now add the paint effect to the swirled UV
    uv *= 30.;
    speed = iTime*(2.);
	vec2 uv2 = vec2(uv.x+uv.y);

    for(int i=0; i < 5; i++) {
		uv2 += sin(max(uv.x, uv.y)) + uv;
		uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*SWIRL_FREQ),sin(uv2.x - SWIRL_FREQ*speed));
		uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
	}

    //Make the paint amount range from 0 - 2
    float contrast_mod = (0.25*contrast + 0.5*spin_amount + 1.2);
	float paint_res =min(2., max(0.,length(uv)*(0.035)*contrast_mod));
    float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
    float c2p = max(0.,1. - contrast_mod*abs(paint_res));
    float c3p = 1. - min(1., c1p + c2p);
	
	float shine = 0.*(0.3*max(c1p*5. - 4., 0.) + 0.4*max(c2p*5. - 4., 0.));

    vec4 ret_col = (0.3/contrast)*colour_1 + (1. - 0.3/contrast)*(colour_1*c1p + colour_2*c2p + vec4(c3p*colour_3.rgb, c3p*colour_1.a)) + shine;

    // ---- particles ----
    vec2 pc = fragCoord.xy;
    #if P_PIXELATE
    pc = floor(pc/pixel_size)*pixel_size + pixel_size*0.5;
    #endif
    vec2 puv = (pc - 0.5*iResolution.xy)/iResolution.y;

    float par  = 0.60*particleLayer(puv*P_DENSITY,     iTime,  0.0);
    par       += 0.35*particleLayer(puv*P_DENSITY*1.9, iTime,  5.7);
    par       += 0.20*particleLayer(puv*P_DENSITY*3.3, iTime, 11.3);
    par = pow(max(par, 0.0), 1.4)*P_BRIGHT;
    par *= smoothstep(0.95, 0.35, length(puv));

    vec3 p_col = mix(vec3(1.0), colour_2.rgb*2.0, 0.55);
    ret_col.rgb += p_col*par;

    // ---- CRT pass ----
    // scanlines
    float scan = 0.5 + 0.5*sin((fragCoord.y/SCAN_PITCH + iTime*SCAN_ROLL)*6.2831853);
    ret_col.rgb *= 1.0 - SCAN_STRENGTH*scan;
    ret_col.rgb *= 1.0 + SCAN_STRENGTH*0.5;   // compensate lost brightness

    // RGB aperture mask (3-pixel triad)
    float px = mod(floor(fragCoord.x), 3.0);
    vec3 mask = vec3(px == 0.0 ? 1.0 : 0.0,
                     px == 1.0 ? 1.0 : 0.0,
                     px == 2.0 ? 1.0 : 0.0);
    ret_col.rgb *= 1.0 - MASK_STRENGTH + MASK_STRENGTH*mask*3.0;

    // vignette
    vec2 vuv = fragCoord.xy/iResolution.xy;
    float vig = pow(16.0*vuv.x*vuv.y*(1.0-vuv.x)*(1.0-vuv.y), CRT_VIGNETTE*0.5);
    ret_col.rgb *= mix(1.0, vig, CRT_VIGNETTE);

    fragColor = ret_col;
}
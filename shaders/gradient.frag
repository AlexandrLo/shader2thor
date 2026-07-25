#define S(a,b,t) smoothstep(a,b,t)

uniform int uTheme;

// ---- theme-dependent parameters (filled at runtime by initTheme) ----------
// The image is a four-corner blend: layer1 is the horizontal gradient of the
// upper half, layer2 the one of the lower half.
vec3 layer1_color1;
vec3 layer1_color2;
vec3 layer2_color1;
vec3 layer2_color2;

void initTheme()
{
    int t = clamp(uTheme, 1, 5);
    if (t == 1) {          // dawn — the original peach/blue look
        layer1_color1 = vec3(.957, .804, .623);
        layer1_color2 = vec3(.192, .384, .933);
        layer2_color1 = vec3(.910, .510, .800);
        layer2_color2 = vec3(.350, .710, .953);
    } else if (t == 2) {   // sunset — amber into magenta and violet
        layer1_color1 = vec3(.996, .741, .376);
        layer1_color2 = vec3(.612, .114, .427);
        layer2_color1 = vec3(.973, .463, .365);
        layer2_color2 = vec3(.404, .204, .678);
    } else if (t == 3) {   // mint — pale mint into deep teal
        layer1_color1 = vec3(.792, .965, .851);
        layer1_color2 = vec3(.043, .353, .404);
        layer2_color1 = vec3(.294, .831, .808);
        layer2_color2 = vec3(.114, .596, .412);
    } else if (t == 4) {   // ember — dark plum with orange embers
        layer1_color1 = vec3(.976, .478, .169);
        layer1_color2 = vec3(.157, .063, .157);
        layer2_color1 = vec3(.694, .110, .212);
        layer2_color2 = vec3(.949, .769, .290);
    } else {               // arctic — ice and lavender over indigo
        layer1_color1 = vec3(.878, .937, .976);
        layer1_color2 = vec3(.235, .294, .573);
        layer2_color1 = vec3(.729, .706, .933);
        layer2_color2 = vec3(.502, .804, .914);
    }
}

mat2 Rot(float a)
{
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash( vec2 p )
{
    p = vec2( dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)) );
	return fract(sin(p)*43758.5453);
}

// Interleaved Gradient Noise (Jorge Jimenez, CoD:AW) remapped to a triangular
// distribution, used to dither the final color and mask 8-bit banding.
float ditherNoise( in vec2 fragCoord )
{
    float noise = fract(52.9829189 * fract(dot(fragCoord, vec2(0.06711056, 0.00583715))));
    return noise - 0.5;
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
	
	vec2 u = f*f*(3.0-2.0*f);

    float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                        dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                   mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                        dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
	return 0.5 + 0.5*n;
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    initTheme();

    vec2 uv = fragCoord/iResolution.xy;
    float ratio = iResolution.x / iResolution.y;

    vec2 tuv = uv;
    tuv -= .5;

    // rotate with Noise, sampled along a circle so it loops exactly every 6*PI
    // seconds instead of drifting forever
    float noiseAngle = iTime / 3.;
    vec2 noiseOffset = .3 * vec2(cos(noiseAngle), sin(noiseAngle));
    float degree = noise(vec2(tuv.x*tuv.y, 0.) + noiseOffset);

    tuv.y *= 1./ratio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
	tuv.y *= ratio;

    
    // Wave warp with sin
    float frequency = 5.;
    float amplitude = 30.;
    float speed = iTime * 2.;
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
   	tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
    
    
    // draw the image
    vec3 layer1 = mix(layer1_color1, layer1_color2, S(-.3, .2, (tuv*Rot(radians(-5.))).x));

    vec3 layer2 = mix(layer2_color1, layer2_color2, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
    
    vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
    
    vec3 col = finalComp;

    // Dither to hide banding: triangular noise well above one quantization
    // step — the image is already a soft blurry gradient, so extra grain reads
    // as texture rather than degrading it
    col += ditherNoise(fragCoord) / 32.0;

    fragColor = vec4(col,1.0);
}
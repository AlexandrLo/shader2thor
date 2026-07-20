#define PI 3.1415926535897932384626433832795
#define PI2 6.2831853071795864769252867665590
#define CIRCLE_COLUMNS 16.0
#define TIME_SCALE 0.04

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    float circle_rows = (CIRCLE_COLUMNS * iResolution.y) / iResolution.x;
    float scaledTime = iTime * TIME_SCALE;
    
    float circle = -cos((uv.x - scaledTime) * PI2 * CIRCLE_COLUMNS)
    * cos((uv.y + scaledTime) * PI2 * circle_rows);
    
    float v = -sin(iTime + uv.x - uv.y) - circle,
    stepCircle = smoothstep( 0., 1.5, v/fwidth(v) );
    
    vec4 color1 = vec4(0.07, 0.2, 0.48, 1.0);
    vec4 color2 = vec4(0.2, 0.45, 0.78, 1.0);
    
    fragColor = mix(color1, color2, stepCircle);
}
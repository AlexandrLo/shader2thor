
uniform int uTheme;

// ---- theme-dependent parameters (filled at runtime by initTheme) ----------
vec3 background_color1;
vec3 background_color2;
vec3 wave_color;
float angleDeg;
vec2 bg_gradient_strengths;
float wave_opacity;
float top_glow_strength;     // was BORDER_STRENGTH
float bottom_glow_strength;  // was GLOW_STRENGTH

// ---- fixed parameters (identical across all themes) -----------------------
float wave_speed = 2.5;
float wave_width = 2.5;
float wave_height = 0.8;

vec2 color1_interval = vec2(0.0, 0.3);
vec2 color3_interval = vec2(0.0, 0.9);
float gradient_direction = 70.0;

float top_glow_size = 0.05;  // was BORDER_SIZE, constant across all themes

void initTheme()
{
    int t = clamp(uTheme, 1, 8);
    if (t == 1) {
        background_color1 = vec3(0.0, 0.0, 0.37);
        background_color2 = vec3(0.09019607843137255, 0.47843137254901963, 0.796078431372549);
        wave_color        = vec3(0.09, 0.73, 0.85);
        angleDeg          = 320.0;
        wave_opacity      = 0.13;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 2) {
        background_color1 = vec3(0.5607843137254902, 0.03137254901960784, 0.07450980392156863);
        background_color2 = vec3(0.803921568627451, 0.09411764705882353, 0.011764705882352941);
        wave_color        = vec3(1.0, 0.5058823529411764, 0.08627450980392157);
        angleDeg          = 270.0;
        wave_opacity      = 0.23;
        bg_gradient_strengths = vec2(-0.3, 0.5);
        bottom_glow_strength  = 0.21;
        top_glow_strength     = 0.01;
    } else if (t == 3) {
        background_color1 = vec3(0.23137254901960785, 0.0, 0.9568627450980393);
        background_color2 = vec3(0.9450980392156862, 0.2196078431372549, 0.984313725490196);
        wave_color        = vec3(0.9450980392156862, 0.2196078431372549, 0.984313725490196);
        angleDeg          = 45.0;
        wave_opacity      = 0.001;
        bg_gradient_strengths = vec2(0.3, 1.2);
        bottom_glow_strength  = 0.0;
        top_glow_strength     = 0.3;
    } else if (t == 4) {
        background_color1 = vec3(0.19215686274509805, 0.0, 0.34509803921568627);
        background_color2 = vec3(0.6039215686274509, 0.0, 0.8313725490196079);
        wave_color        = vec3(0.8, 0.09019607843137255, 0.792156862745098);
        angleDeg          = 270.0;
        wave_opacity      = 0.3;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.04;
        top_glow_strength     = 0.01;
    } else if (t == 5) {
        background_color1 = vec3(0.2235294117647059, 0.047058823529411764, 0.0392156862745098);
        background_color2 = vec3(0.3764705882352941, 0.1568627450980392, 0.13333333333333333);
        wave_color        = vec3(0.9098039215686274, 0.27450980392156865, 0.1450980392156863);
        angleDeg          = 35.0;
        wave_opacity      = 0.09;
        bg_gradient_strengths = vec2(-0.0, 2.3);
        bottom_glow_strength  = 0.08;
        top_glow_strength     = 0.01;
    } else if (t == 6) {
        background_color1 = vec3(0.3843137254901961, 0.28627450980392155, 0.12156862745098039);
        background_color2 = vec3(0.796078431372549, 0.7137254901960784, 0.5529411764705883);
        wave_color        = vec3(0.9019607843137255, 0.796078431372549, 0.5019607843137255);
        angleDeg          = 45.0;
        wave_opacity      = 0.001;
        bg_gradient_strengths = vec2(-0.0, 1.2);
        bottom_glow_strength  = 0.0;
        top_glow_strength     = 0.2;
    } else if (t == 7) {
        background_color1 = vec3(0.0, 0.0, 0.0);
        background_color2 = vec3(0.0, 0.0, 0.0);
        wave_color        = vec3(0.2235294117647059, 0.2235294117647059, 0.2980392156862745);
        angleDeg          = 35.0;
        wave_opacity      = 0.18;
        bg_gradient_strengths = vec2(-0.0, 2.3);
        bottom_glow_strength  = 0.05;
        top_glow_strength     = 0.01;
    } else {
        background_color1 = vec3(0.6470588235294118, 0.6784313725490196, 0.8352941176470589);
        background_color2 = vec3(0.9372549019607843, 0.7450980392156863, 0.8745098039215686);
        wave_color        = vec3(0.9098039215686274, 0.8627450980392157, 0.9921568627450981);
        angleDeg          = 50.0;
        wave_opacity      = 0.1;
        bg_gradient_strengths = vec2(0.3, 1.0);
        bottom_glow_strength  = 0.04;
        top_glow_strength     = 0.01;
    }
}

// Interleaved Gradient Noise (Jorge Jimenez, CoD:AW) remapped to a triangular
// distribution, used to dither the final color and mask banding.
float ditherNoise( in vec2 fragCoord )
{
    float noise = fract(52.9829189 * fract(dot(fragCoord, vec2(0.06711056, 0.00583715))));
    return noise - 0.5;
}

vec3 background(vec2 coord)
{

    vec3 uColorStart = background_color1;
    vec3 uColorEnd   = background_color2;


    float rad = radians(angleDeg);
    vec2 uDir = vec2(cos(rad), sin(rad));

    vec2 vUvYDown = vec2(coord.x, 1.0 - coord.y);


    float t00 = 0.0 * uDir.x + 0.0 * uDir.y;
    float t10 = 1.0 * uDir.x + 0.0 * uDir.y;
    float t01 = 0.0 * uDir.x + 1.0 * uDir.y;
    float t11 = 1.0 * uDir.x + 1.0 * uDir.y;

    float uTMin = min(min(t00, t10), min(t01, t11));
    float tMax  = max(max(t00, t10), max(t01, t11));
    float uTSpan = max(1e-6, tMax - uTMin);

    float t = dot(vUvYDown, uDir);

    float u = clamp((t - uTMin) / uTSpan, 0.0, 1.0);
    float g = smoothstep(bg_gradient_strengths.x, bg_gradient_strengths.y, u);
    vec3 col = mix(uColorStart, uColorEnd, g);

    return col;
}



vec3 wavegradient(float dist) {
    return
    (vec3(top_glow_strength) * smoothstep(0.0, 1.0, 1.0-clamp((dist/top_glow_size), 0.0, 1.0)))
    +
    (vec3(bottom_glow_strength) * smoothstep(0.0, 1.0, clamp((dist/0.2), 0.0, 1.0)))
    +
    (vec3(bottom_glow_strength) * smoothstep(0.0, 1.0, clamp((dist/0.6), 0.0, 1.0)));
}

float waveMask(float dist)
{

    float aa = fwidth(dist) * 0.5;
    float mask = 1.0 - smoothstep(-aa, aa, dist);
    return mask;
}

vec3 fg(float dist) {
    float mask = waveMask(dist);
    vec3 base = wave_color*wave_opacity;

    base += wavegradient(-1.0 * dist) * base / (max(base.x, max(base.y, base.z)));;

    return base * mask;
}




vec4 mainImage_(vec2 fragCoord)
{
    vec2 g_TexelSize = 1.0 / iResolution.xy;
    float height = iResolution.y;

    float unit = 0.0;
    float unit_height = 0.0;
    if (iResolution.x / iResolution.y > 2.0) {
        unit = (iResolution.x / iResolution.y) * 5.0;
        unit_height = height / 3.0;
    } else {
        unit = 10.0;
        unit_height = 0.1 * iResolution.y * (iResolution.x / iResolution.y);
    }

    vec2 uv = (fragCoord) * vec2(unit, height) * g_TexelSize;

    float X = uv.x;
    float Y = uv.y;

    float time_base = iTime * wave_speed;
    // half of the shader's 24pi loop period in time_base units, used to
    // de-sync the top-screen wave's animation from the bottom one
    float half_period = 6.0 * 3.14159265;
    float time_base_top = time_base + half_period;

    float height_mod1 = 1.0 + sin(time_base/12.0)*0.15;
    float height_mod2 = 0.9 + sin(time_base/12.0)*0.15;
    float height_mod1_top = 1.0 + sin(time_base_top/12.0)*0.15;
    float height_mod2_top = 0.9 + sin(time_base_top/12.0)*0.15;

    float dynamic_height = 1.2 + (sin(time_base / 8.0) * 0.2);
    float dynamic_width = 1.2 + (sin(time_base / 8.0) * 0.2);

    // horizon pushed a bit lower than the old 2/3 mark so the bottom-screen
    // ocean isn't crammed into the top third of that screen
    float horizon = height * 0.72;
    float Y_top = height - Y; // mirrors the bottom wave into the top screen

    // wave 1
    float wave1 = sin(X/1.7 - time_base / 12.0)*0.5 * height_mod1;
    float wave1_1 = sin(X/1.0 + time_base / 4.0)*0.04;
    float wave1_top = sin(X/1.7 - time_base_top / 12.0)*0.5 * height_mod1_top;
    float wave1_1_top = sin(X/1.0 + time_base_top / 4.0)*0.04;

    float dist1 = ((wave1 + wave1_1) * unit_height - Y + horizon) / height;
    vec3 col1 = fg(dist1);

    float dist1_top = ((wave1_top + wave1_1_top) * unit_height - Y_top + horizon) / height;
    vec3 col1_top = fg(dist1_top);

    // wave 2
    float wave2 = sin(X/1.7 - (time_base + sin(time_base/4.0)*2.0) / 12.0)*0.5 * height_mod2;
    float wave2_1 = sin(X/1.0 + time_base / 4.0)*0.08;
    float wave2_top = sin(X/1.7 - (time_base_top + sin(time_base_top/4.0)*2.0) / 12.0)*0.5 * height_mod2_top;
    float wave2_1_top = sin(X/1.0 + time_base_top / 4.0)*0.08;

    float dist2 = ((wave2 + wave2_1) * unit_height - Y + horizon) / height;
    vec3 col2 = fg(dist2);

    float dist2_top = ((wave2_top + wave2_1_top) * unit_height - Y_top + horizon) / height;
    vec3 col2_top = fg(dist2_top);

    // Time varying pixel color
    vec3 col = col1 + col2 + col1_top + col2_top;

    return vec4(col,0.0);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    initTheme();

    vec2 g_TexelSize = 1.0 / iResolution.xy;

    vec2 uv = fragCoord;
    uv.y = iResolution.y - uv.y;

    // única amostra (scale = 1)
    vec4 acc = mainImage_(uv);

    vec4 finalColor =
    vec4(background(uv * g_TexelSize), 1.0)
    + acc;

    vec3 col = finalColor.rgb;

    // Dither to hide banding
    col += ditherNoise(fragCoord) / 32.0;

    fragColor = vec4(col, 1.0);
}

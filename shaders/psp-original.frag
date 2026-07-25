
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

// how far the second wave of a pair diverges from the first
float wave_pair_phase = 0.5;  // extra phase shift of wave 2, in radians
float wave_pair_amp   = 0.9;  // wave 2 amplitude, relative to wave 1's 1.0

vec2 color1_interval = vec2(0.0, 0.3);
vec2 color3_interval = vec2(0.0, 0.9);
float gradient_direction = 70.0;

float top_glow_size = 0.05;  // was BORDER_SIZE, constant across all themes

// thin gradient border hugging the wave crest, on top of the wider top glow
float rim_strength  = 0.05;   // brightness of the border at the crest
float rim_size      = 0.015;  // thickness, in units of screen height
float rim_whiteness = 0.5;    // how far the border color is pushed toward white

void initTheme()
{
    int t = clamp(uTheme, 1, 34);
    if (t == 1) {
        background_color1 = vec3(0.866421568627451, 0.3931372549019608, 0.49754901960784315);
        background_color2 = vec3(0.8958333333333334, 0.5568627450980392, 0.675);
        wave_color        = vec3(1.0, 0.6216142270861833, 0.7534883720930232);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 2) {
        background_color1 = vec3(0.17818627450980393, 0.17450980392156862, 0.2840686274509804);
        background_color2 = vec3(0.2840686274509804, 0.2656862745098039, 0.4004901960784314);
        wave_color        = vec3(0.7093023255813954, 0.6634026927784578, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 3) {
        background_color1 = vec3(0.3110294117647059, 0.6063725490196078, 0.13529411764705881);
        background_color2 = vec3(0.5071078431372549, 0.7215686274509804, 0.20857843137254903);
        wave_color        = vec3(0.7027853260869565, 1.0, 0.2890625);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 4) {
        background_color1 = vec3(0.8816176470588235, 0.16862745098039217, 0.39044117647058824);
        background_color2 = vec3(0.8980392156862745, 0.2931372549019608, 0.6112745098039216);
        wave_color        = vec3(1.0, 0.3264192139737991, 0.6806768558951966);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 5) {
        background_color1 = vec3(0.11666666666666667, 0.11200980392156863, 0.19558823529411765);
        background_color2 = vec3(0.19681372549019607, 0.1676470588235294, 0.26176470588235295);
        wave_color        = vec3(0.75187265917603, 0.6404494382022472, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 6) {
        background_color1 = vec3(0.8943627450980393, 0.38504901960784316, 0.5463235294117647);
        background_color2 = vec3(0.8590686274509803, 0.640686274509804, 0.6825980392156863);
        wave_color        = vec3(1.0, 0.7457917261055634, 0.7945791726105563);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 7) {
        background_color1 = vec3(0.7051470588235295, 0.0, 0.1875);
        background_color2 = vec3(0.8904411764705882, 0.0, 0.39705882352941174);
        wave_color        = vec3(1.0, 0.0, 0.44591246903385634);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 8) {
        background_color1 = vec3(0.029411764705882353, 0.025245098039215687, 0.09191176470588236);
        background_color2 = vec3(0.0732843137254902, 0.04264705882352941, 0.12867647058823528);
        wave_color        = vec3(0.5695238095238095, 0.33142857142857146, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 9) {
        background_color1 = vec3(0.012745098039215686, 0.3012254901960784, 0.08872549019607844);
        background_color2 = vec3(0.10514705882352941, 0.515686274509804, 0.1);
        wave_color        = vec3(0.2038973384030418, 1.0, 0.19391634980988595);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 10) {
        background_color1 = vec3(0.6654411764705882, 0.14362745098039215, 0.5227941176470589);
        background_color2 = vec3(0.8026960784313726, 0.2090686274509804, 0.6377450980392156);
        wave_color        = vec3(1.0, 0.26045801526717555, 0.7945038167938931);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 11) {
        background_color1 = vec3(0.0, 0.0, 0.04338235294117647);
        background_color2 = vec3(0.1681372549019608, 0.1681372549019608, 0.2178921568627451);
        wave_color        = vec3(0.7716535433070866, 0.7716535433070866, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 12) {
        background_color1 = vec3(0.442156862745098, 0.2901960784313726, 0.6272058823529412);
        background_color2 = vec3(0.5892156862745098, 0.40122549019607845, 0.8);
        wave_color        = vec3(0.7365196078431373, 0.5015318627450981, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 13) {
        background_color1 = vec3(0.4610294117647059, 0.0, 0.35661764705882354);
        background_color2 = vec3(0.7029411764705882, 0.00392156862745098, 0.4982843137254902);
        wave_color        = vec3(1.0, 0.005578800557880056, 0.7088563458856346);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 14) {
        background_color1 = vec3(0.5725490196078431, 0.5958333333333333, 0.7490196078431373);
        background_color2 = vec3(0.8183823529411764, 0.6656862745098039, 0.7607843137254902);
        wave_color        = vec3(1.0, 0.8134171907756813, 0.9296196466007787);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 15) {
        background_color1 = vec3(0.022549019607843137, 0.5747549019607843, 0.6480392156862745);
        background_color2 = vec3(0.050980392156862744, 0.6276960784313725, 0.7524509803921569);
        wave_color        = vec3(0.06775244299674267, 0.8342019543973942, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 16) {
        background_color1 = vec3(0.3174019607843137, 0.0, 0.16936274509803922);
        background_color2 = vec3(0.5634803921568627, 0.0, 0.38848039215686275);
        wave_color        = vec3(1.0, 0.0, 0.6894301870378425);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 17) {
        background_color1 = vec3(0.45294117647058824, 0.47549019607843135, 0.4970588235294118);
        background_color2 = vec3(0.6100490196078432, 0.6345588235294117, 0.6767156862745098);
        wave_color        = vec3(0.9014849692140529, 0.9377037305324157, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 18) {
        background_color1 = vec3(0.0031862745098039215, 0.08480392156862746, 0.40122549019607845);
        background_color2 = vec3(0.05367647058823529, 0.5816176470588236, 0.7595588235294117);
        wave_color        = vec3(0.07066795740561471, 0.7657308809293321, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 19) {
        background_color1 = vec3(0.47009803921568627, 0.43848039215686274, 0.645343137254902);
        background_color2 = vec3(0.6321078431372549, 0.5884803921568628, 0.7600490196078431);
        wave_color        = vec3(0.8316672041277008, 0.7742663656884875, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 20) {
        background_color1 = vec3(0.051470588235294115, 0.0392156862745098, 0.4482843137254902);
        background_color2 = vec3(0.7328431372549019, 0.40612745098039216, 0.8899509803921568);
        wave_color        = vec3(0.8234646103001928, 0.45634811346736437, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 21) {
        background_color1 = vec3(0.21495098039215688, 0.025245098039215687, 0.35318627450980394);
        background_color2 = vec3(0.4825980392156863, 0.08946078431372549, 0.5698529411764706);
        wave_color        = vec3(0.8468817204301076, 0.15698924731182795, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 22) {
        background_color1 = vec3(0.26004901960784316, 0.27009803921568626, 0.546813725490196);
        background_color2 = vec3(0.43504901960784315, 0.3941176470588235, 0.6906862745098039);
        wave_color        = vec3(0.6298793470546487, 0.5706174591909156, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 23) {
        background_color1 = vec3(0.5262254901960784, 0.0014705882352941176, 0.22230392156862744);
        background_color2 = vec3(0.8887254901960784, 0.4698529411764706, 0.5696078431372549);
        wave_color        = vec3(1.0, 0.5286817429674572, 0.6409266409266409);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 24) {
        background_color1 = vec3(0.8980392156862745, 0.49240196078431375, 0.16029411764705884);
        background_color2 = vec3(0.8980392156862745, 0.6254901960784314, 0.22916666666666666);
        wave_color        = vec3(1.0, 0.6965065502183406, 0.25518558951965065);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 25) {
        background_color1 = vec3(0.1840686274509804, 0.20955882352941177, 0.45122549019607844);
        background_color2 = vec3(0.3656862745098039, 0.31495098039215685, 0.6384803921568627);
        wave_color        = vec3(0.5727447216890594, 0.4932821497120921, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 26) {
        background_color1 = vec3(0.6823529411764706, 0.4708333333333333, 0.009313725490196078);
        background_color2 = vec3(0.8465686274509804, 0.7492647058823529, 0.2622549019607843);
        wave_color        = vec3(1.0, 0.8850607990735379, 0.30978575564562827);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 27) {
        background_color1 = vec3(0.183578431372549, 0.026470588235294117, 0.006617647058823529);
        background_color2 = vec3(0.3127450980392157, 0.1125, 0.0661764705882353);
        wave_color        = vec3(1.0, 0.359717868338558, 0.2115987460815047);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 28) {
        background_color1 = vec3(0.0, 0.754656862745098, 0.20563725490196078);
        background_color2 = vec3(0.0, 0.8225490196078431, 0.5676470588235294);
        wave_color        = vec3(0.0, 1.0, 0.6901072705601907);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 29) {
        background_color1 = vec3(0.37450980392156863, 0.2754901960784314, 0.11887254901960784);
        background_color2 = vec3(0.7605392156862745, 0.6950980392156862, 0.5419117647058823);
        wave_color        = vec3(1.0, 0.9139542378343539, 0.7125362552368676);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 30) {
        background_color1 = vec3(0.6049019607843137, 0.06568627450980392, 0.03627450980392157);
        background_color2 = vec3(0.7818627450980392, 0.14019607843137255, 0.027205882352941177);
        wave_color        = vec3(1.0, 0.1793103448275862, 0.034796238244514104);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 31) {
        background_color1 = vec3(0.00392156862745098, 0.6220588235294118, 0.19338235294117648);
        background_color2 = vec3(0.00392156862745098, 0.7509803921568627, 0.49166666666666664);
        wave_color        = vec3(0.005221932114882507, 1.0, 0.6546997389033943);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 32) {
        background_color1 = vec3(0.6110294117647059, 0.6276960784313725, 0.6808823529411765);
        background_color2 = vec3(0.6941176470588235, 0.7058823529411765, 0.7458333333333333);
        wave_color        = vec3(0.9306605323693723, 0.9464344396976668, 1.0);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else if (t == 33) {
        background_color1 = vec3(0.0, 0.43651960784313726, 0.15294117647058825);
        background_color2 = vec3(0.0, 0.6519607843137255, 0.3);
        wave_color        = vec3(0.0, 1.0, 0.4601503759398496);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
    } else {
        background_color1 = vec3(0.8274509803921568, 0.6178921568627451, 0.07107843137254902);
        background_color2 = vec3(0.8274509803921568, 0.6857843137254902, 0.04387254901960784);
        wave_color        = vec3(1.0, 0.8287914691943128, 0.05302132701421801);
        angleDeg          = 320.0;
        wave_opacity      = 0.14;
        bg_gradient_strengths = vec2(-0.0, 1.0);
        bottom_glow_strength  = 0.15;
        top_glow_strength     = 0.02;
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

// `depth` is how far inside the wave the pixel is (0 at the crest, growing
// downwards); the border is brightest at the crest and fades over rim_size
float rimgradient(float depth) {
    return rim_strength * (1.0 - smoothstep(0.0, rim_size, max(depth, 0.0)));
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

    vec3 tint = base / (max(base.x, max(base.y, base.z)));
    base += wavegradient(-1.0 * dist) * tint;
    base += rimgradient(-1.0 * dist) * mix(tint, vec3(1.0), rim_whiteness);

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
    float height_mod2 = wave_pair_amp + sin(time_base/12.0)*0.15;
    float height_mod1_top = 1.0 + sin(time_base_top/12.0)*0.15;
    float height_mod2_top = wave_pair_amp + sin(time_base_top/12.0)*0.15;

    float dynamic_height = 1.2 + (sin(time_base / 8.0) * 0.2);
    float dynamic_width = 1.2 + (sin(time_base / 8.0) * 0.2);

    // horizon pushed a bit lower than the old 2/3 mark so the bottom-screen
    // ocean isn't crammed into the top third of that screen
    float horizon = height * 0.75;
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
    float wave2 = sin(X/1.7 + wave_pair_phase - (time_base + sin(time_base/4.0)*2.0) / 12.0)*0.5 * height_mod2;
    float wave2_1 = sin(X/1.0 + time_base / 4.0)*0.08;
    float wave2_top = sin(X/1.7 + wave_pair_phase - (time_base_top + sin(time_base_top/4.0)*2.0) / 12.0)*0.5 * height_mod2_top;
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

mat2 r(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c,-s,s,c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = ((fragCoord-.5*iResolution.xy)/iResolution.y*9.+10.)*r(iTime*.039269908169872414);
    float id = mod(floor(uv.x)+floor(uv.y),2.);
    float f = smoothstep(-.6,.6,cos(fract(iTime*.15*(id*2.-1.)+id*.5)*3.1415));
    vec2 guv = (fract(uv)-.5)*(cos(fract(iTime*.15+id*.5)*6.282)*.5+1.5)*r(f*1.5707);
    fragColor = vec4(.5,.2,1,1)*(length(max(abs(guv)-.25,0.)) < .1 ? 1. : .6);
}
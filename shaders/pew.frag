vec4 color = vec4(244.0 / 255.0, 1.0 / 255.0, 93.0 / 255.0, 1.0);

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float refHeight = iResolution.x * 9.0 / 16.0;
    vec2 uv = vec2(fragCoord.x / iResolution.x, fragCoord.y / refHeight);

    uv.x += 0.1 * sin(uv.y);
    uv.y += 0.2 * sin(uv.x * 18.0 + 2. * sin((3. * atan(uv.y) - 3./2.) + iTime) + iTime);
    uv.y += 0.1 * sin(uv.x * 15.0 + 2. * sin((2. * atan(uv.y) - 1.) + iTime) + iTime); 
    color *= smoothstep(0.5, 0.585, abs(sin(uv.y * 20. + iTime * 3.)));

    // Output to screen
    fragColor = vec4(color);
}
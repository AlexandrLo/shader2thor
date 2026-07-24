// Interleaved Gradient Noise (Jorge Jimenez, CoD:AW) remapped to a triangular
// distribution, used to dither the final color and mask banding.
float ditherNoise( in vec2 fragCoord )
{
    float noise = fract(52.9829189 * fract(dot(fragCoord, vec2(0.06711056, 0.00583715))));
    return noise - 0.5;
}

void mainImage( out vec4 fragColor, vec2 fragCoord )
{
    float time = iTime * 0.25;
    vec2 resolution = iResolution.xy,
         uv = ( fragCoord - .5*resolution ) / resolution.y,
         warp = resolution-resolution, accumColor=warp, phase;
    mat2 rot = mat2(cos(vec4(1,12,34,1)));

    for(float scale = 10., iter=0.; iter++ < 30.; scale *= 1.2  )
        uv *= rot, warp *= rot,
        warp += sin( phase = uv*scale + iter + warp + time ),
        accumColor += cos(phase)/scale;

    vec3 col = (vec4(1,1,1,0) * (accumColor.x+accumColor.y+.15)*0.15 + .0005/length(accumColor)).rgb;

    // Dither to hide banding
    col += ditherNoise(fragCoord) / 128.0;

    fragColor = vec4(col, 1.);
}

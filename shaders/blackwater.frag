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

    fragColor = vec4(1,1,1,0) * (accumColor.x+accumColor.y+.15)*0.15 + .0005/length(accumColor) ;
}

#version 100

precision highp float;

uniform float time;
uniform vec2 mouse;       //0 to 1, screen cords
uniform vec2 resolution;  //viewport resolution
uniform int darkmode;     //If the hugo site is in darkmode or not

float a = 12.9898;
float b = 78.233;
float c = 43758.5453;

//From https://stackoverflow.com/a/4275343/6342516
//Nice little pseudorandom noise generator, with time added in
float rand(vec2 co){
    return fract(sin(dot(co, vec2(a, b))) * c);
}

void main()
{
    vec2 mouse2 = vec2(mouse.x, mouse.y);
    float dist = distance(gl_FragCoord.xy, mouse2); 
    float r = rand(dist * gl_FragCoord.xy); 
    if(darkmode == 0){
        r = r * 0.5 + 0.5;
    }else{
        r = r * 0.5;
    }
    gl_FragColor = vec4(r, r, r, 1.0);
}
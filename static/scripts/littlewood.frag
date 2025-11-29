#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 mouse;       //0 to 1, screen cords
uniform vec2 resolution;  //viewport resolution
uniform int darkmode;     //If the hugo site is in darkmode or not

vec2 center = vec2(0.0, 0.0); 
float zoom = 0.5;
const float threshold = 0.1;
const int maxDegree = 9;

vec2 complex_mul(vec2 a, vec2 b){
    return vec2(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

float complex_dist(vec2 a){
    return sqrt(a.x * a.x + a.y * a.y);
}

// Pretty bad brute-force littlewood evaluation with no caching
bool evaluateLittlewood(vec2 cord, int degree, vec2 mousepos) {
    for(int i = 0; i < degree * degree; i++){
        vec2 z = vec2(0.0, 0.0);
        int cb = i;
        vec2 x = cord;
        for(int j = 0; j < degree; j++){
            float c = (cb % 2) == 1 ? -1.0 : 1.0;
            vec2 v = c * x;
            //if (j == 0) { v *= mousepos.x;}
            //if (j == 1) { v *= mousepos.y;}
            if (j == 0) { v = complex_mul(v, mousepos); };
            z += v;
            cb = cb / 2;
            x = complex_mul(x, cord);
        }
        if(complex_dist(z) < threshold){
            return true;
        }
    }
    return false;
}

vec3 iterateLittlewood(vec2 coord, vec2 mousepos){
    for (int degree = 2; degree <= maxDegree; degree++){
        if(evaluateLittlewood(coord, degree, mousepos)){
            vec3 color = vec3(float(degree) / float(maxDegree));
            if (darkmode == 0){
                color = vec3(1.0) - color;
            }
            return color;
        }
    }
    return vec3(1.0 - float(darkmode));
}

void main() {
    vec2 windowSize = resolution.xy; //resolution.xy;

    mat3 transOrigin = mat3(1, 0, 0, 0, 1, 0, -windowSize.x/2.0, -windowSize.y/2.0, 1);    //center screen on (0, 0)
    mat3 scaleNorm = mat3(1.0/windowSize.x, 0, 0, 0, 1.0/windowSize.y, 0, 0, 0, 1);        //scale screen to 1, 1
    mat3 scaleBounds = mat3(3.5, 0, 0, 0, 2.0, 0, 0, 0, 1);                                //scale screen to the optimal mandelbrot viewing dims (THIS IS MESSING UP MOBILE)
    if(windowSize.x < windowSize.y)
        scaleBounds = mat3(2, 0, 0, 0, 3.5, 0, 0, 0, 1);                                   //Help scaling for mobile
    mat3 scaleZoom = mat3(1.0/zoom, 0, 0, 0, 1.0/zoom, 0, 0, 0, 1);
    mat3 transCenter = mat3(1, 0, 0, 0, 1, 0, center.x, center.y, 1);                      //Really don't need this since we're not moving the center around

    vec2 pos = vec3(scaleZoom * scaleBounds * scaleNorm * transOrigin * vec3(gl_FragCoord.xy,1)).xy;

    //mouse position on current cords
    vec2 mousepos = vec3(scaleZoom * scaleBounds * scaleNorm * transOrigin * vec3(mouse.xy, 1)).xy;
    mousepos = (vec3(mousepos.x, -mousepos.y, 1)).xy;
    mousepos.x += sin(time / 1000.0) * 0.5;
    mousepos.y += cos(time / 1000.0) * 0.5;

    mat3 transMouse = mat3(1, 0, 0, 0, 1, 0, mousepos.x, mousepos.y, 1);
    mat3 untransMouse = mat3(1, 0, 0, 0, 1, 0, -mousepos.x, -mousepos.y, 1);

    vec2 modifiedpos = (transCenter * transMouse * untransMouse * vec3(pos, 1)).xy;

    fragColor = vec4(iterateLittlewood(modifiedpos, mousepos), 1.0);
}
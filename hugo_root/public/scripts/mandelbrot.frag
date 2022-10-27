#version 100

precision highp float;

uniform float time;
uniform vec2 mouse;       //0 to 1, screen cords
uniform vec2 resolution;  //veiwport resolution
uniform int darkmode;     //If the hugo site is in darkmode or not

vec2 windowSize = resolution.xy; //resolution.xy;
vec2 center = vec2(0.0, 0.0); 
float zoom = 0.8;
const int maxIterations = 300;

vec2 squareImaginary(vec2 number){
    return vec2(
        pow(number.x,2.0)-pow(number.y,2.0),
        2.0*number.x*number.y
    );
}

float hypot(vec2 z) {
  float x = abs(z.x);
  float y = abs(z.y);
  float t = min(x, y);
  x = max(x, y);
  t = t / x;
  return (z.x == 0.0 && z.y == 0.0) ? 0.0 : x * sqrt(1.0 + t * t);
}

vec2 cpow(vec2 z, float x){
    float r = hypot(z);
    float theta = atan(z.y, z.x) * x;
    return vec2(cos(theta), sin(theta)) * pow(r, x);
}

//f(z+1) = z^2 + c
vec3 iterateMandelbrot(vec2 coord){
    vec2 z = vec2(0, 0);
    for(int i = 0; i < maxIterations; i++){
        z = cpow(z, 2.0) + coord;
        if(length(z) > 2.0){
            float color = float(i)/float(maxIterations);
            if(darkmode == 0){
                color = 1.0 - color;
            }
            return vec3(color, color, color);
        }
    }
    if(darkmode == 1){
        return vec3(0, 0, 0);
    }else{
        return vec3(1.0, 1.0 , 1.0);
    }

}

float fisheye(float x){
    const float a = 5.0; 
    return (a * cos(4.0 * 3.141 * x) + a + 1.0);
}

#define PI 3.1415926535897932384626433832795

//https://www.desmos.com/calculator/n9vfe3g5jp
float zoomlens(float dist, float radius){
    float maxZoomLevel = 0.1;
    float zoomLevel = maxZoomLevel * sin(time / 10000.0); //Smaller is bigger zoom
    float waveOffset = 2.0/radius;
    if(dist >= 1.0/waveOffset){
        return ((1.0-zoomLevel)/2.0)*cos(waveOffset*PI*dist) + ((1.0+zoomLevel)/2.0);
    }else{
        return zoomLevel;
    }
}

void main() {
    mat3 transOrigin = mat3(1, 0, 0, 0, 1, 0, -windowSize.x/2.0, -windowSize.y/2.0, 1);   //center screen on (0, 0)
    mat3 scaleNorm = mat3(1.0/windowSize.x, 0, 0, 0, 1.0/windowSize.y, 0, 0, 0, 1);       //scale screen to 1, 1
    mat3 scaleBounds = mat3(3.5, 0, 0, 0, 2.0, 0, 0, 0, 1);                               //scale screen to the optimal mandelbrot veiwing dims (THIS IS MESSING UP MOBILE)
    if(windowSize.x < windowSize.y)
        scaleBounds = mat3(2, 0, 0, 0, 3.5, 0, 0, 0, 1);                                //Help scaling for mobile
    mat3 scaleZoom = mat3(1.0/zoom, 0, 0, 0, 1.0/zoom, 0, 0, 0, 1);
    mat3 transCenter = mat3(1, 0, 0, 0, 1, 0, center.x, center.y, 1);                      //Really don't need this since we're not moving the center around

    float angle = float(time)/50000.0;
    mat3 rotTime = mat3(cos(angle), sin(angle), 0, -sin(angle), cos(angle), 0, 0, 0, 1);

    vec2 pos = vec3(scaleZoom * scaleBounds * scaleNorm * transOrigin * vec3(gl_FragCoord.xy,1)).xy;

    //mouse position on current cords
    vec2 mousepos = vec3(scaleZoom * scaleBounds * scaleNorm * transOrigin * vec3(mouse.xy, 1)).xy;
    mousepos = (vec3(mousepos.x, -mousepos.y, 1)).xy;

    float dist = distance(pos, mousepos); 
    mat3 scaleMouseZoom = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
    float radius = 0.5;
    if(dist < radius){
        scaleMouseZoom = mat3(zoomlens(dist, radius), 0, 0, 0, zoomlens(dist, radius), 0, 0, 0, 1);
    }

    mat3 transMouse = mat3(1, 0, 0, 0, 1, 0, mousepos.x, mousepos.y, 1);
    mat3 untransMouse = mat3(1, 0, 0, 0, 1, 0, -mousepos.x, -mousepos.y, 1);

    vec2 modifiedpos = (transCenter * transMouse * scaleMouseZoom * untransMouse * vec3(pos, 1)).xy;

    gl_FragColor = vec4(iterateMandelbrot(modifiedpos), 1.0);
}
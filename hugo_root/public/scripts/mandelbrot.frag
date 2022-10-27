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

float distort(float x){
    return 1.0/(70.0 * x + 4.0); 
}

float fisheye(float x){
    const float a = 1.0; 
    return (a * cos(4.0 * 3.141 * x) + a + 1.0);
}

//f(z+1) = z^2 + c
vec3 iterateMandelbrot(vec2 coord, vec2 mousepos){
    float dist = distance(coord, mousepos);
    if(dist < 0.25){
        mat3 zoom = mat3(fisheye(dist), 0, 0, 0, fisheye(dist), 0, 0, 0, 1);
        coord = (zoom * vec3(coord, 1)).xy;
    }
    //if(dist < 0.1){
    //    return vec3(1.0, 0, 0);
    //}
    //coord = vec2(coord.x + distort(dist), coord.y + distort(dist));
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

void main() {
    mat3 transOrigin = mat3(1, 0, 0, 0, 1, 0, -windowSize.x/2.0, -windowSize.y/2.0, 1);   //center screen on (0, 0)
    mat3 scaleNorm = mat3(1.0/windowSize.x, 0, 0, 0, 1.0/windowSize.y, 0, 0, 0, 1);       //scale screen to 1, 1
    mat3 scaleZoom = mat3(1.0/zoom, 0, 0, 0, 1.0/zoom, 0, 0, 0, 1);
    mat3 scaleBounds = mat3(3.5, 0, 0, 0, 2.0, 0, 0, 0, 1);                               //scale screen to 1, 1
    mat3 transCenter = mat3(1, 0, 0, 0, 1, 0, center.x, center.y, 1);
    float angle = float(time)/50000.0;
    mat3 rotTime = mat3(cos(angle), sin(angle), 0, -sin(angle), cos(angle), 0, 0, 0, 1);
    vec2 pos = vec3(rotTime * transCenter * scaleZoom * scaleBounds * scaleNorm * transOrigin * vec3(gl_FragCoord.xy,1)).xy;
    vec2 mousepos = vec3(scaleZoom * scaleBounds * scaleNorm * transOrigin * vec3(mouse.xy, 1)).xy;
    mousepos = (rotTime * vec3(mousepos.x, -mousepos.y, 1)).xy;
    //FragColor = length(pos - center) < 0.03 ? vec4(255, 0, 0, 0.5) : vec4(iterateMandelbrot(pos), 1.0);
    gl_FragColor = vec4(iterateMandelbrot(pos, mousepos), 1.0);
}
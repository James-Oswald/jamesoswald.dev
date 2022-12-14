precision highp float;

//uniform float time;
//uniform vec2 mouse;       //0 to 1, screen cords
//uniform vec2 resolution;  

vec2 windowSize = vec2(1080, 720); //resolution.xy;
vec2 center = vec2(0.0, 0.0); 
float zoom = 0.8;
const int maxIterations = 200;

vec3 palette(float t){
    vec3 c1 = vec3(0, 7, 100);
    vec3 c2 = vec3(2, 107, 203);
    vec3 c3 = vec3(237, 255, 255);
    vec3 c4 = vec3(255, 170, 0);
    float x = 1.0 / 3.0;
    if (t < x) return mix(c1, c2, t/x);
    else if (t < 2.0 * x) return mix(c2, c3, (t - x)/x);
    else if (t < 3.0 * x) return mix(c3, c4, (t - 2.0*x)/x);
    return c4;
}

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
  //return x * sqrt(1.0 + t * t);
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
            return vec3(color, color, color);
        }
    }
    return vec3(0, 0, 0);
}

void main() {
    mat3 transOrigin = mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, -windowSize.x/2.0, -windowSize.y/2.0, 1); //center screen on (0, 0)
    mat3 scaleNorm = mat3(1.0/windowSize.x, 0.0, 0.0, 0.0, 1.0/windowSize.y, 0.0, 0.0, 0.0, 1.0); //scale screen to 1, 1
    mat3 scaleZoom = mat3(1.0/zoom, 0.0, 0.0, 0.0, 1.0/zoom, 0.0, 0.0, 0.0, 1.0);
    mat3 scaleBounds = mat3(3.5, 0.0, 0.0, 0.0, 2.0, 0.0, 0, 0, 1); //scale screen to 1, 1
    //dmat3 transCenter = mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
    mat3 transCenter = mat3(1, 0, 0, 0, 1, 0, center.x, center.y, 1);
    //float angle = sin(float(time)/100.0);
    //dmat3 rotTime = dmat3(cos(angle), sin(angle), 0, -sin(angle), cos(angle), 0, 0, 0, 1);
    vec2 pos = vec3(transCenter*scaleZoom*scaleBounds*scaleNorm*transOrigin*vec3(gl_FragCoord.xy,1)).xy;
    //FragColor = length(pos - center) < 0.03 ? vec4(255, 0, 0, 0.5) : vec4(iterateMandelbrot(pos), 1.0);
    gl_FragColor = vec4(iterateMandelbrot(pos), 1.0);
}
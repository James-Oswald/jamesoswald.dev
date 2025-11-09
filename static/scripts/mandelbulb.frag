
// Mandelbulb volumetric raymarcher example, THIS IS NOT MINE, all rights belong to its original author
// loicvdb on shadertoy https://www.shadertoy.com/view/3tXXzX

#version 100

precision highp float;

uniform float time;
uniform vec2 mouse;       //0 to 1, screen cords
uniform vec2 resolution;  //viewport resolution
uniform int darkmode;     //If the hugo site is in darkmode or not

vec2 windowSize = resolution.xy; //resolution.xy;
vec2 center = vec2(0.0, 0.0); 

#define Pi 3.14159265359
#define ViewStart 1.6
#define ViewEnd 4.4


//#define HQ


#ifdef HQ
const int CameraRaySteps = 255;
const int ShadowRaySteps = 64;
const float MaxTransparency = .95;
#else
const int CameraRaySteps = 128;
const int ShadowRaySteps = 16;
float MaxTransparency = .7;
#endif

vec3 DirCam = normalize(vec3(-1, 0, 0));
vec3 PosCam = vec3(3.0, 0, .0);
float FocalLength = 1.0;

vec3 LightColor = vec3(1.5);
vec3 LightPos;

float Density = 25.0;
float Anisotropy = .25;
vec3 VolumeColor = vec3(.1, .15, .2);

float Power;

vec3 powV(vec3 v, float p){
    return vec3(pow(v.x, p), pow(v.y, p), pow(v.z, p));
}

float maxV(vec3 v){
    return max(max(v.x, v.y), v.z);
}

bool insideShape(vec3 pos) {
	vec3 z = pos;
	float r;
	float zr;
    float sinTheta;
    float phi;
    float theta;
	for(int i = 0; i < 4; i++) {
		r = length(z);
		if(r>1.3) break;
		theta = acos(z.z/r)*Power;
		phi = atan(z.y,z.x)*Power;
        sinTheta = sin(theta);
		z = pow(r,Power)*vec3(sinTheta*vec2(cos(phi), sin(phi)), cos(theta)) + pos;
	}
	return r < 1.0 && r > .65;
}

float henyeyGreenstein(vec3 pos, vec3 dir){
	float cosTheta = dot(dir, normalize(LightPos-pos));
 	return Pi/4.0 * (1.0-Anisotropy*Anisotropy) / pow(1.0 + Anisotropy*Anisotropy - 2.0*Anisotropy*cosTheta, 3.0/2.0);
}

vec3 lightReceived(vec3 pos, float headStart){
    
    float LightDist = length(LightPos-pos);
    vec3 LightDir = normalize(LightPos-pos);
    
    float stepSize = LightDist / float(ShadowRaySteps);
    vec3 absorption = vec3(1.0);
    
    pos += headStart * LightDir * stepSize;
    
    for(int i = 0; i < ShadowRaySteps; i++){
        if(insideShape(pos)){
            absorption *= powV(vec3(1)-VolumeColor, stepSize*Density);
        }
        pos += LightDir * stepSize;
    }
    return absorption*LightColor / (LightDist*LightDist);
}


vec3 rotateZ(vec3 p, float angle){
    return vec3(cos(angle) * p.x + sin(angle) * p.y,
                -sin(angle) * p.x + cos(angle) * p.y,
                p.z);
}


void main() {
    
    //quick animation ...
    //DirCam = rotateZ(DirCam, -time/3.0);
    //PosCam = rotateZ(PosCam, -time/3.0);
    Power = abs(cos(time/500000.0)) * 7.0 + 1.0;
    LightPos = vec3(cos(mouse.x/100.0), -sin(mouse.y/100.0), cos(mouse.x/100.0)) * 1.25;

    vec2 uv = (gl_FragCoord.xy - resolution.xy/2.0)/resolution.y;
    
    vec3 camX = vec3(-DirCam.y, DirCam.x, 0);
	vec3 camY = cross(camX, DirCam);
	vec3 sensorX = camX * (uv.x/length(camX));
	vec3 sensorY = camY * (uv.y/length(camY));
	vec3 centerSensor = PosCam - DirCam * FocalLength;
	vec3 posOnSensor = centerSensor + sensorX + sensorY;
	vec3 dir = normalize(PosCam - posOnSensor);
	
    vec3 pos = PosCam + dir*ViewStart;
    float hg = henyeyGreenstein(pos, dir);
    vec3 color;
    
    float stepSize = (ViewEnd-ViewStart) / float(CameraRaySteps);
    vec3 absorption = vec3(1.0);
    
    //float headStart = texture(iChannel0, gl_FragCoord.xy/vec2(1024)).a;
    float headStart = 0.1;

    pos += dir * stepSize;
    
    for(int i = 0; i < CameraRaySteps; i++){
        if(length(LightPos-pos) <.05){
            color += 10.0*absorption*LightColor;
            break;
        }
        if(insideShape(pos)){
            color += VolumeColor*absorption*lightReceived(pos, headStart)*hg*stepSize*Density;
            absorption *= powV(vec3(1)-VolumeColor, stepSize*Density);
        }
        pos += dir * stepSize;
        if(maxV(absorption) < 1.0-MaxTransparency) break;
    }
    
	gl_FragColor = vec4(log(color + vec3(1.0)), 1.0);	//reduces clipping and desaturates bright colors
}
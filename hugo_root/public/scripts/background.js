
//Create the webGL canvas element behind the content div with the right sizes
let content = document.getElementsByClassName("content")[0];
let canvas = document.createElement("canvas");
canvas.id = "backgroundCanvas"
content.appendChild(canvas)

function resizeHandler(){
    canvas.width = content.offsetWidth;
    canvas.height = content.offsetHeight;
    canvas.style.top = content.offsetTop;
}
content.addEventListener('onresize', event => resizeHandler());
resizeHandler(null) //initial scaling

//We have to update uniforms with various globals including mouse position and colorscheme
let mouseX = 0;
let mouseY = 0;
function mouseMoveHandler(e){
    mouseX = e.clientX;
    mouseY = e.clientY - content.offsetTop;
}
content.addEventListener("mousemove", event => mouseMoveHandler(event));

//Observe colorscheme changes
let darkmode = document.body.classList.contains("colorscheme-dark")
function colorschemeChangeHandler(mutationList, observer){
    darkmode = -darkmode+1; //Flip darkmode to whatever its not
}
const observer = new MutationObserver(colorschemeChangeHandler);
observer.observe(document.body, {attributes: true, attributeFilter: ["class"]});



gl = canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.5, 0.5, 0.5, 0.9);

//Utility shader creation function sourced from https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
function createShader(sourceCode, type){
    // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      throw `Could not compile WebGL program. \n\n${info} + ${sourceCode}`;
    }
    return shader;
}

//This has to be global due to requestAnimationFrame not accepting params 
const shader_program = gl.createProgram();      //The shader program
const fullscreen_quad_vbo = gl.createBuffer();  //The fullscreen quad the shader is projected on
let position_attribute = null;
let mouse_uniform = null;
let time_uniform = null;
let resolution_uniform = null;
let darkmode_uniform = null;

function drawBackground(time){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shader_program);
    gl.uniform2f(mouse_uniform, mouseX, mouseY);
    gl.uniform1i(darkmode_uniform, darkmode);
    gl.uniform2f(resolution_uniform, canvas.width, canvas.height);
    gl.uniform1f(time_uniform, time);
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreen_quad_vbo);
    gl.enableVertexAttribArray(position_attribute);
    gl.vertexAttribPointer(position_attribute, 2, gl.FLOAT, false, 0, 0); 
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(drawBackground);
}

//Setup the shader program and the fullscreen quad
function initBackground(shaders){

    //Set up the shader program
    const vertex_shader = createShader(shaders[0], gl.VERTEX_SHADER)
    const fragment_shader = createShader(shaders[1], gl.FRAGMENT_SHADER)
    gl.attachShader(shader_program, vertex_shader);
    gl.attachShader(shader_program, fragment_shader);
    gl.linkProgram(shader_program);
    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)){
        const info = gl.getProgramInfoLog(shader_program);
        throw `Could not compile WebGL program. \n\n${info}`;
    }
    mouse_uniform = gl.getUniformLocation(shader_program, "mouse");
    time_uniform = gl.getUniformLocation(shader_program, "time");
    resolution_uniform = gl.getUniformLocation(shader_program, "resolution");
    darkmode_uniform = gl.getUniformLocation(shader_program, "darkmode");

    //Setup the fullscreen quad that the shader will be drawn onto
    let fullscreen_quad = [
        1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0, -1.0, 1.0,  1.0
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreen_quad_vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fullscreen_quad), gl.STATIC_DRAW);
    position_attribute = gl.getAttribLocation(shader_program, "position")

    window.requestAnimationFrame(drawBackground);
}

//Fetch our shaders then start the webgl program
Promise.all([
    fetch("scripts/mandelbrot.vert").then(x => x.text()),
    fetch("scripts/mandelbrot.frag").then(x => x.text())
]).then(initBackground)

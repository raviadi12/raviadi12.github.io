(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function a(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(i){if(i.ep)return;i.ep=!0;const r=a(i);fetch(i.href,r)}})();const s={};window.addEventListener("keydown",t=>{s[t.key.toLowerCase()]=!0});window.addEventListener("keyup",t=>{s[t.key.toLowerCase()]=!1});function w(t){let e=[0,0,0];s.w&&(e[0]+=t.moveForward[0],e[1]+=t.moveForward[1],e[2]+=t.moveForward[2]),s.s&&(e[0]-=t.moveForward[0],e[1]-=t.moveForward[1],e[2]-=t.moveForward[2]),s.a&&(e[0]-=t.moveRight[0],e[1]-=t.moveRight[1],e[2]-=t.moveRight[2]),s.d&&(e[0]+=t.moveRight[0],e[1]+=t.moveRight[1],e[2]+=t.moveRight[2]);let a=Math.hypot(e[0],e[1],e[2]);return a>0&&(e[0]/=a,e[1]/=a,e[2]/=a),e}function I(t,e){let a=0,o=0;return s.arrowleft&&(a-=e*t),s.arrowright&&(a+=e*t),s.arrowup&&(o+=e*t),s.arrowdown&&(o-=e*t),{deltaYaw:a,deltaPitch:o}}class R{constructor(e,a=0,o=0){this.position=e,this.yaw=a,this.pitch=o,this.speed=1,this.rotationSpeed=.75,this.updateVectors()}updateVectors(){this.forward=[Math.cos(this.pitch)*Math.sin(this.yaw),Math.sin(this.pitch),Math.cos(this.pitch)*Math.cos(this.yaw)],this.right=[Math.sin(this.yaw-Math.PI/2),0,Math.cos(this.yaw-Math.PI/2)],this.up=[this.right[1]*this.forward[2]-this.right[2]*this.forward[1],this.right[2]*this.forward[0]-this.right[0]*this.forward[2],this.right[0]*this.forward[1]-this.right[1]*this.forward[0]],this.moveForward=[Math.sin(this.yaw),0,Math.cos(this.yaw)],this.moveRight=[this.right[0],this.right[1],this.right[2]]}move(e,a){const o=this.speed*a;for(let i=0;i<3;i++)this.position[i]+=e[i]*o}rotate(e,a){this.yaw+=e,this.pitch+=a;const o=Math.PI/2-.01;this.pitch>o&&(this.pitch=o),this.pitch<-o&&(this.pitch=-o),this.updateVectors()}getRotationMatrix(){const e=Math.sin(this.yaw),a=Math.cos(this.yaw),o=Math.sin(this.pitch),i=Math.cos(this.pitch);return[a,0,e,e*o,i,-a*o,-e*i,o,i*a]}}const L=`#version 300 es
precision mediump float;

// Vertex positions for a full-screen quad
const vec2 positions[6] = vec2[](
    vec2(-1.0, -1.0),
    vec2( 1.0, -1.0),
    vec2(-1.0,  1.0),
    vec2(-1.0,  1.0),
    vec2( 1.0, -1.0),
    vec2( 1.0,  1.0)
);

out vec2 vUV;

void main() {
    gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
    vUV = positions[gl_VertexID] * 0.5 + 0.5;
}
`,H=`#version 300 es
precision highp float;
out vec4 outColor;

in vec2 vUV;

// Uniforms
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_cameraPos;
uniform mat3 u_cameraRot;
uniform float u_fogDensity; // Added uniform for fog density

// Constants
#define MAX_BOUNCES 4
#define EPSILON 0.001
#define INF 1e20

#define NUM_LIGHTS 3
#define NUM_SHADOW_SAMPLES 2 // Increased for better soft shadows

// Fog and Sky Colors
const vec3 fogColor = vec3(1.0); // White fog
const vec3 skyColor = vec3(0.529, 0.808, 0.922); // Light blue sky

// Light structure with radius for area lights
struct Light {
    vec3 position;
    vec3 color;
    float radius;
};

// Define three colored area light sources
const Light lights[NUM_LIGHTS] = Light[](
    Light(vec3(5.0, 5.0, 5.0), vec3(1.0, 0.0, 0.0), 0.5), // Red light
    Light(vec3(-5.0, 5.0, 5.0), vec3(0.0, 1.0, 0.0), 0.5), // Green light
    Light(vec3(0.0, -5.0, 5.0), vec3(0.0, 0.0, 1.0), 0.5)  // Blue light
);

// Ray structure
struct Ray {
    vec3 origin;
    vec3 direction;
};

// Hit information
struct HitInfo {
    float t;
    vec3 normal;
    vec3 color;
    float roughness; // Added roughness attribute
    bool hit;
};

// Function to create a rotation matrix around the Y-axis
mat3 rotationY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

// Function to create a rotation matrix around an arbitrary axis
mat3 rotationAxis(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(
        oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
    );
}

// Random number generation functions
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float rand(inout float seed) {
    seed += 1.0;
    return hash(seed);
}

// Define sphere colors and roughness
const vec3 sphereColors[4] = vec3[](
    vec3(0.0, 0.0, 1.0), // First sphere: Pure Blue
    vec3(0.0, 1.0, 0.0), // Second sphere: Pure Green
    vec3(1.0, 0.0, 0.0), // Third sphere: Pure Red
    vec3(1.0, 0.0, 1.0)  // Fourth sphere: Magenta
);

const float sphereRoughness[4] = float[](
    0.2, // First sphere roughness (Low roughness: More mirror-like)
    0.4,  // Second sphere roughness (Medium roughness)
    0.7,  // Third sphere roughness (Higher roughness)
    0.9   // Fourth sphere roughness (Very high roughness: Mostly diffuse)
);

// Define cube colors and roughness
const vec3 cubeColors[4] = vec3[](
    vec3(1.0, 1.0, 0.0), // First cube: Yellow
    vec3(0.0, 1.0, 1.0), // Second cube: Cyan
    vec3(1.0, 0.5, 0.0), // Third cube: Orange
    vec3(0.5, 0.0, 0.5)  // Fourth cube: Purple
);

const float cubeRoughness[4] = float[](
    0.25, // First cube roughness
    0.85, // Second cube roughness
    0.75, // Third cube roughness
    0.9   // Fourth cube roughness
);

// Define pyramid colors and roughness
const vec3 pyramidColors[4] = vec3[](
    vec3(0.5, 1.0, 0.5), // First pyramid: Light Green
    vec3(1.0, 0.75, 0.8), // Second pyramid: Light Pink
    vec3(0.8, 0.8, 0.0), // Third pyramid: Olive
    vec3(0.3, 0.3, 0.3)  // Fourth pyramid: Dark Gray
);

const float pyramidRoughness[4] = float[](
    0.2,  // First pyramid roughness
    0.3,  // Second pyramid roughness
    0.4,  // Third pyramid roughness
    0.55  // Fourth pyramid roughness
);

// Function to compute intersection with a triangle
bool intersectTriangle(vec3 orig, vec3 dir, vec3 vert0, vec3 vert1, vec3 vert2, out float t, out vec3 normal) {
    vec3 edge1 = vert1 - vert0;
    vec3 edge2 = vert2 - vert0;
    vec3 h = cross(dir, edge2);
    float a = dot(edge1, h);
    if (abs(a) < EPSILON)
        return false; // Parallel

    float f = 1.0 / a;
    vec3 s = orig - vert0;
    float u = f * dot(s, h);
    if (u < 0.0 || u > 1.0)
        return false;

    vec3 q = cross(s, edge1);
    float v = f * dot(dir, q);
    if (v < 0.0 || u + v > 1.0)
        return false;

    t = f * dot(edge2, q);
    if (t > EPSILON) {
        normal = normalize(cross(edge1, edge2));
        return true;
    }

    return false;
}

// Intersection with Sphere at position with rotation
bool intersectSphere(Ray ray, vec3 spherePos, mat3 sphereRot, float sphereRadius, vec3 sphereColor, float sphereRoughness, out HitInfo hitInfo) {
    // Transform ray to sphere's local space
    vec3 originLocal = sphereRot * (ray.origin - spherePos);
    vec3 directionLocal = sphereRot * ray.direction;

    // Sphere intersection (assuming sphere is centered at origin in local space)
    float a = dot(directionLocal, directionLocal);
    float b = 2.0 * dot(directionLocal, originLocal);
    float c = dot(originLocal, originLocal) - sphereRadius * sphereRadius;

    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) {
        hitInfo.hit = false;
        return false;
    }

    float sqrtDisc = sqrt(discriminant);
    float t1 = (-b - sqrtDisc) / (2.0 * a);
    float t2 = (-b + sqrtDisc) / (2.0 * a);

    float t = t1;
    if (t < EPSILON) {
        t = t2;
        if (t < EPSILON) {
            hitInfo.hit = false;
            return false;
        }
    }

    // Compute hit point in local space
    vec3 hitPointLocal = originLocal + directionLocal * t;

    // Compute normal in local space
    vec3 normalLocal = normalize(hitPointLocal);

    // Transform normal back to world space
    vec3 normal = normalize(transpose(sphereRot) * normalLocal);

    hitInfo.t = t;
    hitInfo.normal = normal;
    hitInfo.color = sphereColor;       // Assign sphere color
    hitInfo.roughness = sphereRoughness; // Assign sphere roughness
    hitInfo.hit = true;
    return true;
}

// Intersection with Axis-Aligned Cube at position
bool intersectCube(Ray ray, vec3 cubePos, vec3 cubeSize, vec3 cubeColor, float cubeRoughness, out HitInfo hitInfo) {
    vec3 cubeMin = cubePos - cubeSize * 0.5;
    vec3 cubeMax = cubePos + cubeSize * 0.5;

    vec3 invDir = 1.0 / ray.direction;
    vec3 tMin = (cubeMin - ray.origin) * invDir;
    vec3 tMax = (cubeMax - ray.origin) * invDir;

    vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);

    float tNear = max(max(t1.x, t1.y), t1.z);
    float tFar = min(min(t2.x, t2.y), t2.z);

    if (tNear > tFar || tFar < EPSILON) {
        hitInfo.hit = false;
        return false;
    }

    float t = tNear;
    if (t < EPSILON) {
        t = tFar;
        if (t < EPSILON) {
            hitInfo.hit = false;
            return false;
        }
    }

    vec3 hitPoint = ray.origin + ray.direction * t;
    vec3 normal;

    // Determine the normal based on which face was hit
    float bias = 1e-4;
    if (abs(hitPoint.x - cubeMin.x) < bias) normal = vec3(-1.0, 0.0, 0.0);
    else if (abs(hitPoint.x - cubeMax.x) < bias) normal = vec3(1.0, 0.0, 0.0);
    else if (abs(hitPoint.y - cubeMin.y) < bias) normal = vec3(0.0, -1.0, 0.0);
    else if (abs(hitPoint.y - cubeMax.y) < bias) normal = vec3(0.0, 1.0, 0.0);
    else if (abs(hitPoint.z - cubeMin.z) < bias) normal = vec3(0.0, 0.0, -1.0);
    else normal = vec3(0.0, 0.0, 1.0);

    hitInfo.t = t;
    hitInfo.normal = normal;
    hitInfo.color = cubeColor;
    hitInfo.roughness = cubeRoughness;
    hitInfo.hit = true;
    return true;
}

// Intersection with Pyramid at position
bool intersectPyramid(Ray ray, vec3 pyramidPos, float pyramidHeight, float pyramidBaseSize, vec3 pyramidColor, float pyramidRoughness, out HitInfo hitInfo) {
    // Transform ray to pyramid's local space
    // Assuming pyramid base is centered at pyramidPos with Y up

    // Define pyramid vertices
    vec3 apex = pyramidPos + vec3(0.0, pyramidHeight * 0.5, 0.0);
    vec3 baseCenter = pyramidPos - vec3(0.0, pyramidHeight * 0.5, 0.0);
    float halfSize = pyramidBaseSize * 0.5;

    // Define base plane
    vec3 baseNormal = vec3(0.0, 1.0, 0.0);
    float baseD = dot(baseNormal, baseCenter);

    // Ray-plane intersection for base
    float denom = dot(baseNormal, ray.direction);
    if (abs(denom) > EPSILON) {
        float t = (baseD - dot(baseNormal, ray.origin)) / denom;
        if (t > EPSILON) {
            vec3 hitPoint = ray.origin + ray.direction * t;
            if (abs(hitPoint.x - pyramidPos.x) <= halfSize && abs(hitPoint.z - pyramidPos.z) <= halfSize) {
                hitInfo.t = t;
                hitInfo.normal = baseNormal;
                hitInfo.color = pyramidColor;
                hitInfo.roughness = pyramidRoughness;
                hitInfo.hit = true;
                return true;
            }
        }
    }

    // Define four triangular sides
    // Front
    vec3 v0 = apex;
    vec3 v1 = baseCenter + vec3(-halfSize, 0.0, halfSize);
    vec3 v2 = baseCenter + vec3(halfSize, 0.0, halfSize);

    // Back
    vec3 v3 = apex;
    vec3 v4 = baseCenter + vec3(halfSize, 0.0, -halfSize);
    vec3 v5 = baseCenter + vec3(-halfSize, 0.0, -halfSize);

    // Left
    vec3 v6 = apex;
    vec3 v7 = baseCenter + vec3(-halfSize, 0.0, -halfSize);
    vec3 v8 = baseCenter + vec3(-halfSize, 0.0, halfSize);

    // Right
    vec3 v9 = apex;
    vec3 v10 = baseCenter + vec3(halfSize, 0.0, halfSize);
    vec3 v11 = baseCenter + vec3(halfSize, 0.0, -halfSize);

    HitInfo tempHit;
    bool hit = false;
    float closestT = INF;
    vec3 closestNormal = vec3(0.0);
    vec3 closestColor = vec3(0.0);
    float closestRoughness = 0.0;

    // Front face
    float t;
    vec3 triNormal;
    if (intersectTriangle(ray.origin, ray.direction, v0, v1, v2, t, triNormal)) {
        if (t < closestT) {
            closestT = t;
            closestNormal = triNormal;
            closestColor = pyramidColor;
            closestRoughness = pyramidRoughness;
            hit = true;
        }
    }

    // Back face
    if (intersectTriangle(ray.origin, ray.direction, v3, v4, v5, t, triNormal)) {
        if (t < closestT) {
            closestT = t;
            closestNormal = triNormal;
            closestColor = pyramidColor;
            closestRoughness = pyramidRoughness;
            hit = true;
        }
    }

    // Left face
    if (intersectTriangle(ray.origin, ray.direction, v6, v7, v8, t, triNormal)) {
        if (t < closestT) {
            closestT = t;
            closestNormal = triNormal;
            closestColor = pyramidColor;
            closestRoughness = pyramidRoughness;
            hit = true;
        }
    }

    // Right face
    if (intersectTriangle(ray.origin, ray.direction, v9, v10, v11, t, triNormal)) {
        if (t < closestT) {
            closestT = t;
            closestNormal = triNormal;
            closestColor = pyramidColor;
            closestRoughness = pyramidRoughness;
            hit = true;
        }
    }

    if (hit) {
        hitInfo.t = closestT;
        hitInfo.normal = closestNormal;
        hitInfo.color = closestColor;
        hitInfo.roughness = closestRoughness;
        hitInfo.hit = true;
        return true;
    }

    hitInfo.hit = false;
    return false;
}

// Intersection with Plane at y = planeY
bool intersectPlane(Ray ray, float planeY, out HitInfo hitInfo) {
    vec3 planeNormal = vec3(0.0, 1.0, 0.0);
    float denom = dot(planeNormal, ray.direction);
    if (abs(denom) < EPSILON) {
        hitInfo.hit = false;
        return false; // Ray is parallel to the plane
    }

    float t = (planeY - ray.origin.y) / ray.direction.y;
    if (t < EPSILON) {
        hitInfo.hit = false;
        return false; // Intersection behind the ray origin
    }

    // Compute hit point
    vec3 hitPoint = ray.origin + ray.direction * t;

    // Simple checkerboard pattern
    float checkerSize = 1.0;
    float checker = mod(floor(hitPoint.x / checkerSize) + floor(hitPoint.z / checkerSize), 2.0);
    vec3 color = mix(vec3(0.8), vec3(0.2), checker);

    // Assign a default roughness for the plane
    float planeRoughness = 0.2; // Adjust as needed

    hitInfo.t = t;
    hitInfo.normal = planeNormal;
    hitInfo.color = color;
    hitInfo.roughness = planeRoughness;
    hitInfo.hit = true;
    return true;
}

// Find the closest intersection
bool findClosestHit(Ray ray, out HitInfo closestHit) {
    closestHit.t = INF;
    closestHit.hit = false;

    // Define object rows
    float objectSpacing = 4.0; // Space between objects
    int numSpheres = 4;
    int numCubes = 4;
    int numPyramids = 4;
    float sphereRadius = 1.0;
    vec3 cubeSize = vec3(2.0); // Uniform cube size
    float pyramidHeight = 1.5;
    float pyramidBaseSize = 2.0;

    // ----- Spheres Row -----
    for (int i = 0; i < numSpheres; i++) {
        // Seed for randomization based on sphere index
        float seed = float(i) * 12.9898 + 78.233;

        // Random movement offsets
        float moveAmplitude = 0.5; // Maximum movement offset
        float moveSpeed = 0.1;      // Speed of movement

        // Calculate movement offsets using sine and cosine for smooth oscillation
        float offsetX = sin(u_time * moveSpeed + hash(seed)) * moveAmplitude;
        float offsetY = sin(u_time * moveSpeed + hash(seed + 1.0)) * moveAmplitude;
        float offsetZ = sin(u_time * moveSpeed + hash(seed + 2.0)) * moveAmplitude;

        // Base position
        vec3 baseSpherePos = vec3(-objectSpacing, sphereRadius, -objectSpacing * float(i) + objectSpacing * 1.5);

        // Apply random movement
        vec3 spherePos = baseSpherePos + vec3(offsetX, offsetY, offsetZ);

        // Random rotation speed and axis
        float rotationSpeed = 0.2 + hash(seed + 3.0) * 0.1; // radians per second
        vec3 rotationAxisRandom = normalize(vec3(hash(seed + 4.0), hash(seed + 5.0), hash(seed + 6.0)));
        float angle = u_time * rotationSpeed;
        mat3 sphereRot = rotationAxis(rotationAxisRandom, angle);

        // Pass sphere color and roughness
        HitInfo tempHit;
        bool hit = intersectSphere(ray, spherePos, sphereRot, sphereRadius, sphereColors[i], sphereRoughness[i], tempHit);
        if (hit && tempHit.t < closestHit.t) {
            closestHit = tempHit;
        }
    }

    // ----- Cubes Row -----
    for (int i = 0; i < numCubes; i++) {
        // Seed for randomization based on cube index
        float seed = float(i) * 24.9898 + 76.233;

        // Random movement offsets
        float moveAmplitude = 0.5; // Maximum movement offset
        float moveSpeed = 0.1;      // Speed of movement

        // Calculate movement offsets using sine and cosine for smooth oscillation
        float offsetX = cos(u_time * moveSpeed + hash(seed)) * moveAmplitude;
        float offsetY = cos(u_time * moveSpeed + hash(seed + 1.0)) * moveAmplitude;
        float offsetZ = cos(u_time * moveSpeed + hash(seed + 2.0)) * moveAmplitude;

        // Base position
        vec3 baseCubePos = vec3(0.0, cubeSize.y * 0.5, -objectSpacing * float(i) + objectSpacing * 1.5);

        // Apply random movement
        vec3 cubePos = baseCubePos + vec3(offsetX, offsetY, offsetZ);

        // Random rotation speed and axis
        float rotationSpeed = 0.105 + hash(seed + 3.0) * 0.05; // radians per second
        vec3 rotationAxisRandom = normalize(vec3(hash(seed + 4.0), hash(seed + 5.0), hash(seed + 6.0)));
        float angle = u_time * rotationSpeed;
        mat3 cubeRot = rotationAxis(rotationAxisRandom, angle);

        HitInfo tempHit;
        bool hit = intersectCube(ray, cubePos, cubeSize, cubeColors[i], cubeRoughness[i], tempHit);
        if (hit && tempHit.t < closestHit.t) {
            closestHit = tempHit;
        }
    }

    // ----- Pyramids Row -----
    for (int i = 0; i < numPyramids; i++) {
        // Seed for randomization based on pyramid index
        float seed = float(i) * 36.9898 + 34.233;

        // Random movement offsets
        float moveAmplitude = 0.5; // Maximum movement offset
        float moveSpeed = 0.1;      // Speed of movement

        // Calculate movement offsets using sine and cosine for smooth oscillation
        float offsetX = sin(u_time * moveSpeed + hash(seed)) * moveAmplitude;
        float offsetY = sin(u_time * moveSpeed + hash(seed + 1.0)) * moveAmplitude;
        float offsetZ = sin(u_time * moveSpeed + hash(seed + 2.0)) * moveAmplitude;

        // Base position
        vec3 basePyramidPos = vec3(objectSpacing, pyramidHeight * 0.5, -objectSpacing * float(i) + objectSpacing * 1.5);

        // Apply random movement
        vec3 pyramidPos = basePyramidPos + vec3(offsetX, offsetY, offsetZ);

        // Random rotation speed and axis
        float rotationSpeed = 0.1 + hash(seed + 3.0) * 0.05; // radians per second
        vec3 rotationAxisRandom = normalize(vec3(hash(seed + 4.0), hash(seed + 5.0), hash(seed + 6.0)));
        float angle = u_time * rotationSpeed;
        mat3 pyramidRot = rotationAxis(rotationAxisRandom, angle);

        // For pyramids, we need to modify the intersection function to accept rotation
        // However, to keep it simple, we'll assume pyramids are axis-aligned
        // If rotation is desired, the intersection function must be updated accordingly
        // Here, we'll skip rotation for pyramids or implement a basic rotation

        // Pass pyramid color and roughness
        HitInfo tempHit;
        bool hit = intersectPyramid(ray, pyramidPos, pyramidHeight, pyramidBaseSize, pyramidColors[i], pyramidRoughness[i], tempHit);
        if (hit && tempHit.t < closestHit.t) {
            closestHit = tempHit;
        }
    }

    // ----- Intersection with Plane at y = 0.0 -----
    HitInfo planeHit;
    bool planeIntersection = intersectPlane(ray, 0.0, planeHit);
    if (planeIntersection && planeHit.t < closestHit.t) {
        closestHit = planeHit;
    }

    return closestHit.hit;
}

// Function to sample a microfacet normal based on roughness using GGX distribution
vec3 sampleGGXNormal(vec3 N, float roughness, inout float seed) {
    float r1 = rand(seed);
    float r2 = rand(seed);

    float a = roughness * roughness;
    float phi = 2.0 * 3.14159265359 * r1;
    float cosTheta = sqrt((1.0 - r2) / (1.0 + (a * a - 1.0) * r2));
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);

    // Spherical coordinates to Cartesian
    vec3 Ht = vec3(
        sinTheta * cos(phi),
        sinTheta * sin(phi),
        cosTheta
    );

    // Transform Ht to world space
    vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangentX = normalize(cross(up, N));
    vec3 tangentY = cross(N, tangentX);

    vec3 H = normalize(tangentX * Ht.x + tangentY * Ht.y + N * Ht.z);

    return H;
}

// Trace a single ray with iterative bounces, soft shadows, and accumulate distance for fog
vec3 trace(Ray ray, int maxBounces, out float totalDistance, inout float seed) {
    vec3 accumulatedColor = vec3(0.0);
    vec3 throughput = vec3(1.0);
    totalDistance = 0.0;

    for (int bounce = 0; bounce < maxBounces; bounce++) {
        HitInfo hitInfo;
        bool hit = findClosestHit(ray, hitInfo);
        if (!hit) {
            // If no hit, accumulate sky color
            accumulatedColor += throughput * skyColor;
            break;
        }

        // Accumulate distance
        totalDistance += hitInfo.t;

        // Compute hit point
        vec3 hitPoint = ray.origin + ray.direction * hitInfo.t;

        // Direct illumination (soft shadows)
        vec3 directLighting = vec3(0.0);
        for (int i = 0; i < NUM_LIGHTS; i++) {
            float shadowFactor = 0.0;

            // Stratified sampling for soft shadows
            for (int s = 0; s < NUM_SHADOW_SAMPLES; s++) {
                float u = (float(s) + rand(seed)) / float(NUM_SHADOW_SAMPLES);
                float v = rand(seed);

                float angle = u * 2.0 * 3.14159265359;
                float radius = sqrt(v) * lights[i].radius;

                vec3 samplePos = lights[i].position + vec3(radius * cos(angle), 0.0, radius * sin(angle));

                vec3 toLight = samplePos - hitPoint;
                float distanceToLight = length(toLight);
                vec3 lightDir = normalize(toLight);

                Ray shadowRay;
                shadowRay.origin = hitPoint + hitInfo.normal * EPSILON;
                shadowRay.direction = lightDir;

                HitInfo shadowHit;
                bool inShadow = findClosestHit(shadowRay, shadowHit) && shadowHit.t < distanceToLight;
                if (!inShadow) {
                    float NdotL = max(dot(hitInfo.normal, lightDir), 0.0);
                    shadowFactor += NdotL;
                }
            }

            shadowFactor /= float(NUM_SHADOW_SAMPLES);
            directLighting += lights[i].color * shadowFactor;
        }

        // Accumulate direct lighting
        accumulatedColor += throughput * hitInfo.color * directLighting;

        // Compute reflection using microfacet model
        vec3 V = -ray.direction;
        vec3 H = sampleGGXNormal(hitInfo.normal, hitInfo.roughness, seed);
        vec3 L = reflect(-V, H);

        // Compute dot products
        float NdotL = max(dot(hitInfo.normal, L), 0.0);
        float NdotV = max(dot(hitInfo.normal, V), 0.0);
        float NdotH = max(dot(hitInfo.normal, H), 0.0);
        float VdotH = max(dot(V, H), 0.0);

        if (NdotL <= 0.0 || NdotV <= 0.0)
            break;

        // Fresnel term using Schlick's approximation
        float F0 = 0.04; // Assuming non-metallic surface
        float F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);

        // Distribution term (GGX)
        float alpha = hitInfo.roughness * hitInfo.roughness;
        float alpha2 = alpha * alpha;
        float denom = (NdotH * NdotH * (alpha2 - 1.0) + 1.0);
        float D = alpha2 / (3.14159265359 * denom * denom);

        // Geometry term (Smith's method)
        float k = alpha / 2.0;
        float G_Smith = NdotV / (NdotV * (1.0 - k) + k);
        G_Smith *= NdotL / (NdotL * (1.0 - k) + k);

        // Cook-Torrance BRDF
        float spec = (D * F * G_Smith) / (4.0 * NdotV * NdotL + 0.001);

        // PDF for GGX sampling
        float pdf = D * NdotH / (4.0 * VdotH + 0.001);

        // Update throughput
        throughput *= hitInfo.color * spec / (pdf + 0.001);

        // Update ray for next bounce
        ray.origin = hitPoint + L * EPSILON;
        ray.direction = L;

        // Russian Roulette Termination
        if (bounce > 2) {
            float p = max(throughput.r, max(throughput.g, throughput.b));
            if (rand(seed) > p)
                break;
            throughput /= p;
        }
    }

    return accumulatedColor;
}

void main() {
    // Initialize seed per fragment
    float seed = dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time;

    // Normalize device coordinates
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Ray direction based on camera rotation
    vec3 forward = u_cameraRot[2];
    vec3 right = u_cameraRot[0];
    vec3 up = u_cameraRot[1];

    float fov = radians(60.0);
    float scale = tan(fov * 0.5);

    vec3 rayDir = normalize(forward + uv.x * scale * right + uv.y * scale * up);

    // Initialize primary ray
    Ray primaryRay;
    primaryRay.origin = u_cameraPos;
    primaryRay.direction = rayDir;

    // Trace the ray and get accumulated distance
    float distance;
    vec3 color = trace(primaryRay, MAX_BOUNCES, distance, seed);

    // Compute fog factor based on distance
    float fogFactor = clamp(distance * u_fogDensity, 0.0, 1.0);

    // Blend the accumulated color with fogColor based on fogFactor
    vec3 finalColor = mix(color, fogColor, fogFactor);

    // Gamma correction
    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    outColor = vec4(finalColor, 1.0);
}
`;function u(t,e,a){const o=t.createShader(e);return t.shaderSource(o,a),t.compileShader(o),t.getShaderParameter(o,t.COMPILE_STATUS)?o:(console.error("Could not compile shader:",t.getShaderInfoLog(o)),t.deleteShader(o),null)}function C(t,e,a){const o=t.createProgram();return t.attachShader(o,e),t.attachShader(o,a),t.linkProgram(o),t.getProgramParameter(o,t.LINK_STATUS)?o:(console.error("Program failed to link:",t.getProgramInfoLog(o)),t.deleteProgram(o),null)}function N(){const t=document.getElementById("glCanvas"),e=t.getContext("webgl2");if(!e){alert("WebGL2 is not available in your browser.");return}function a(){t.width=window.innerWidth,t.height=window.innerHeight,e.viewport(0,0,e.drawingBufferWidth,e.drawingBufferHeight)}window.addEventListener("resize",a),a();const o=u(e,e.VERTEX_SHADER,L);if(!o)return;const i=u(e,e.FRAGMENT_SHADER,H);if(!i)return;const r=C(e,o,i);if(!r)return;e.useProgram(r);const c=e.getUniformLocation(r,"u_time"),m=e.getUniformLocation(r,"u_resolution"),p=e.getUniformLocation(r,"u_cameraPos"),v=e.getUniformLocation(r,"u_cameraRot"),g=e.getUniformLocation(r,"u_fogDensity");e.bindVertexArray(e.createVertexArray());const n=new R([0,3,10]);let h=Date.now();function f(){const l=Date.now(),d=(l-h)/1e3;h=l;let b=w(n);n.move(b,d);const{deltaYaw:S,deltaPitch:x}=I(d,n.rotationSpeed);n.rotate(S,x);const P=(l-y)/1e3;e.uniform1f(c,P),e.uniform2f(m,e.drawingBufferWidth,e.drawingBufferHeight),e.uniform3fv(p,n.position),e.uniformMatrix3fv(v,!1,n.getRotationMatrix()),e.uniform1f(g,.01),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(f)}const y=Date.now();requestAnimationFrame(f)}window.onload=N;

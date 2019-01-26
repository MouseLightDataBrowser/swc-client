import * as path from "path";
import THREE = require("three");

require("three-obj-loader")(THREE);

const OrbitControls = require("ndb-three-orbit-controls")(THREE);

export class SwcNodeData {
    sampleNumber: number;
    parentNumber: number;
    type: number;
    x: number;
    y: number;
    z: number;
    radius: number;
}

export type SwcData = Map<number, SwcNodeData>;

export class SceneManager {
    /* swc neuron json object:
     *	{ id : {
     *		type: <type number of node (string)>,
     *		x: <x position of node (float)>,
     *		y: <y position of node (float)>,
     *		z: <z position of node (float)>,
     *		parent: <id number of node"s parent (-1 if no parent)>,
     *		radius: <radius of node (float)>,
     *		}
     *	}
     */

    public flipYAxis = true;

    public centerPoint: THREE.Vector3 = new THREE.Vector3(0.0, 0.0, 0.0);
    public compartmentOffset: THREE.Vector3 = new THREE.Vector3(5687.5436, 3849.609985, 6595.3813);

    public compartmentUrl = "/static/allen/obj/";

    private renderer: THREE.WebGLRenderer = null;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera = null;
    private readonly neuronGroup: THREE.Group;
    private readonly compartmentGroup: THREE.Group;

    private last_anim_timestamp: number = null;
    private trackControls: any = null;

    private readonly _neurons = new Map<string, THREE.Object3D>();

    public constructor(container: HTMLElement) {
        if (container === null) {
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setClearColor(new THREE.Color(0.98, 0.98, 0.98), 1);

        this.renderer.setSize(width, height);

        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        const fov = 45;
        //const cameraPosition = this.calculateCameraPosition(fov);
        const cameraPosition = -15000;
        this.camera = new THREE.PerspectiveCamera(fov, width / height, 1, cameraPosition * 5);
        this.scene.add(this.camera);

        this.camera.position.z = cameraPosition;

        if (this.flipYAxis === true) {
            this.camera.up.setY(-1);
        }

        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, 10000);
        this.scene.add(light);

        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 0, -10000);
        this.scene.add(light);

        this.neuronGroup = new THREE.Group();
        this.scene.add(this.neuronGroup);

        this.compartmentGroup = new THREE.Group();
        this.scene.add(this.compartmentGroup);

        this.trackControls = new OrbitControls(this.camera, container);
        this.trackControls.addEventListener("change", () => this.render());

        window.addEventListener("resize", () => this.setSize(container.clientWidth, container.clientHeight/*this.renderer.getSize().height*/));
    };

    public animate(timestamp: number = null) {
        if (!this.last_anim_timestamp) {
            this.last_anim_timestamp = timestamp;
            this.render();
        } else if (timestamp - this.last_anim_timestamp > 50) {
            this.last_anim_timestamp = timestamp;
            this.trackControls.update();
            this.render();
        }

        window.requestAnimationFrame((timestamp: number) => this.animate(timestamp));
    };

    public setSize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.render();
    }

    public loadNeuron(name: string, color: string, nodes: SwcData) {
        const neuron = this.createNeuron(nodes, color);

        neuron.name = name;

        if (this.centerPoint !== null) {
            neuron.position.set(-this.centerPoint.x, -this.centerPoint.y, -this.centerPoint.z);
        }

        this._neurons.set(name, neuron);

        this.neuronGroup.add(neuron);
    };

    public removeAllNeurons() {
        this.neuronGroup.remove(...this.neuronGroup.children);
    }

    public loadCompartment(id: string, geometryFile: string, color: string) {
        const loader = new THREE.OBJLoader();

        const url = path.join(this.compartmentUrl + geometryFile);

        loader.load(url, (object: THREE.Group) => this.createCompartment(object, id, color),
            (xhr) => this.onCompartmentLoadProgress(xhr),
            (xhr) => this.onCompartmentLoadError(xhr));
    };

    public unloadCompartment(id: string) {
        const selectedObj = this.scene.getObjectByName(id);
        this.scene.remove(selectedObj);
    }

    private generateSkeleton(node: any, node_parent: any) {
        const vertex = new THREE.Vector3(node.x, node.y, node.z);

        const vertex_parent = new THREE.Vector3(node_parent.x, node_parent.y, node_parent.z);

        return {
            "child": vertex,
            "parent": vertex_parent
        };
    };

    private createNeuron(swcData: SwcData, color: string) {
        const neuron = new THREE.Object3D();

        const material = new THREE.LineBasicMaterial({color: new THREE.Color(color)});

        const geometry = new THREE.Geometry();

        Array.from(swcData.values()).map(node => {
            if (node.parentNumber !== -1) {
                const vertices = this.generateSkeleton(node, swcData.get(node.parentNumber));
                geometry.vertices.push(vertices.child);
                geometry.vertices.push(vertices.parent);
            }
        });

        const line = new THREE.LineSegments(geometry, material);

        neuron.add(line);

        return neuron;
    };

    private createCompartment(object: THREE.Group, id: string, color: string) {
        object.traverse((child: THREE.Mesh) => {
            child.material = new THREE.ShaderMaterial({
                uniforms: {
                    color: {type: 'c', value: new THREE.Color('#' + color)},
                },
                vertexShader: `
					#line 585
					varying vec3 normal_in_camera;
					varying vec3 view_direction;

					void main() {
						vec4 pos_in_camera = modelViewMatrix * vec4(position, 1.0);
						gl_Position = projectionMatrix * pos_in_camera;
						normal_in_camera = normalize(mat3(modelViewMatrix) * normal);
						view_direction = normalize(pos_in_camera.xyz);
					}
				`,
                fragmentShader: `
                	#line 597
                	uniform vec3 color;
					varying vec3 normal_in_camera;
					varying vec3 view_direction;

					void main() {
						// Make edges more opaque than center
						float edginess = 1.0 - abs(dot(normal_in_camera, view_direction));
						float opacity = clamp(edginess - 0.30, 0.0, 0.5);
						// Darken compartment at the very edge
						float blackness = pow(edginess, 4.0) - 0.3;
						vec3 c = mix(color, vec3(0,0,0), blackness);
						gl_FragColor = vec4(c, opacity);
					}
				`,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                side: THREE.DoubleSide,
            });
        });

        object.name = id;

        if (this.centerPoint !== null) {
            object.position.set(-(this.centerPoint.x + this.compartmentOffset.x),
                -(this.centerPoint.y + this.compartmentOffset.y),
                -(this.centerPoint.z + this.compartmentOffset.z));
        }

        this.scene.add(object);
    }

    private onCompartmentLoadProgress(xhr: any) {
        console.log(xhr);
    }

    private onCompartmentLoadError(xhr: any) {
        console.log(xhr);
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }
}

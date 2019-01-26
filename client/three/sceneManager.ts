import THREE = require("three");

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

    private renderer: THREE.WebGLRenderer = null;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera = null;
    private last_anim_timestamp: number = null;
    private trackControls: any = null;

    private readonly _neurons = new Map<string,THREE.Object3D >();

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
        const cameraPosition = -10000;
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

        this.trackControls = new OrbitControls(this.camera, container);
        this.trackControls.addEventListener("change", () => this.render());

        window.addEventListener("resize", () => this.setSize(container.clientWidth, this.renderer.getSize().height));
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
        this.scene.add(neuron);

        if (this.centerPoint !== null) {
            neuron.position.set(-this.centerPoint.x, -this.centerPoint.y, -this.centerPoint.z);
        }

        this._neurons.set(name, neuron);
    };

    public removeAll() {
        this.scene.remove(...this.scene.children);
    }

    /*
    public unloadNeuron(filename: any) {
        const neuron = this.scene.getObjectByName(filename);
        this.scene.remove(neuron);
    };

    public setNeuronVisible(id: string, visible: boolean) {
        const neuron = this.scene.getObjectByName(id);

        if (neuron) {
            neuron.children.map((c: any) => {
                if (c.userData.materialShader) {
                    c.userData.materialShader.uniforms.alpha.value = visible ? 1.0 : 0.0;
                }
            });
        }
    };

    public setBackground(color: any) {
        this.backgroundColor = color;
        this.renderer.setClearColor(this.backgroundColor, 1);
    }

    private calculateBoundingBox(swc_json: any) {
        const boundingBox = {
            xmin: Infinity,
            xmax: -Infinity,
            ymin: Infinity,
            ymax: -Infinity,
            zmin: Infinity,
            zmax: -Infinity
        };

        for (const node in swc_json) {
            if (swc_json.hasOwnProperty(node)) {
                if (swc_json[node].x < boundingBox.xmin) boundingBox.xmin = swc_json[node].x;
                if (swc_json[node].x > boundingBox.xmax) boundingBox.xmax = swc_json[node].x;
                if (swc_json[node].y < boundingBox.ymin) boundingBox.ymin = swc_json[node].y;
                if (swc_json[node].y > boundingBox.ymax) boundingBox.ymax = swc_json[node].y;
                if (swc_json[node].z < boundingBox.zmin) boundingBox.zmin = swc_json[node].z;
                if (swc_json[node].z > boundingBox.zmax) boundingBox.zmax = swc_json[node].z;
            }
        }
        return boundingBox;
    };

    //calculates camera position based on bounding box
    private calculateCameraPosition(fov: any, center: any, boundingBox: any) {
        const x1 = Math.floor(center[0] - boundingBox.xmin) * 2;
        const x2 = Math.floor(boundingBox.xmax - center[0]) * 2;
        const y1 = Math.floor(center[1] - boundingBox.ymin) * 2;
        const y2 = Math.floor(boundingBox.ymax - center[1]) * 2;
        const max_bb = Math.max(x1, x2, y1, y2);
        //fudge factor 1.15 to ensure whole neuron fits
        return (max_bb / (Math.tan(fov * (Math.PI / 180.0) / 2) * 2)) * 1.15;
    };
    */

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

    private render() {
        this.renderer.render(this.scene, this.camera);
    };
}

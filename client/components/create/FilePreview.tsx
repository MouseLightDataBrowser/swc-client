import * as React from "react";
import {CSSProperties} from "react";

import {SceneManager, SwcData, SwcNodeData} from "../../three/sceneManager";

export class SwcInputFile {
    file: File;
    nodeCount: number;
}

type FilePreviewProps = {
    style?: CSSProperties
    file: File;

    onFileReceived(file: File): void;
    onFileIsInvalid(): void;
    onFileLoaded(swcInputFile: SwcInputFile): void;
}

type FilePreviewState = {
    cachedFile: File;
}

export class FilePreview extends React.Component<FilePreviewProps, FilePreviewState> {
    private _sceneManager: SceneManager;

    public constructor(props: FilePreviewProps) {
        super(props);

        this.state = {
            cachedFile: null
        };

        this.loadFile(props.file);
    }

    public componentDidMount() {
        // this.updateDimensions();

        // window.addEventListener("resize", () => this.updateDimensions());


        this.createViewer();
        // this.prepareAndRenderTracings(this.props);
    }

    public componentWillReceiveProps(nextProps: Readonly<FilePreviewProps>): void {
        this.loadFile(nextProps.file);
    }

    public render() {
        const style = Object.assign({}, this.props.style || {}, {
            border: "none"
        });
        return (
            <div id="viewer-container" onDrop={(evt: any) => {
                evt.preventDefault();
                if (evt.dataTransfer.items.length > 0 && evt.dataTransfer.items[0].kind == "file") {
                    // this.loadFile(evt.dataTransfer.items[0].getAsFile());
                    this.props.onFileReceived(evt.dataTransfer.items[0].getAsFile());
                }
            }} onDragOver={(evt: any) => {
                evt.preventDefault();
                evt.dataTransfer.dropEffect = "copy";
            }} style={style}/>

        );
    }

    private createViewer() {
        const container = document.getElementById("viewer-container");

        this._sceneManager = new SceneManager(container);

        this._sceneManager.animate();
    }

    private loadFile(file: File) {
        if (file === this.state.cachedFile) {
            return;
        }

        if (file === null) {
            this._sceneManager.removeAllNeurons();
            return;
        }

        const reader = new FileReader();

        reader.onload = ((data: ProgressEvent) => {
            if (data.loaded === data.total) {
                const lines = (reader.result as string).split(/\r\n|\r|\n/g);

                const nodes = lines.map(line => {
                    if (line.trim().startsWith("#")) {
                        return null;
                    }
                    const nodeContents = line.split(/\s/).map(n => n.trim());
                    try {
                        const node = new SwcNodeData();

                        node.sampleNumber = parseInt(nodeContents[0]);

                        if (isNaN(node.sampleNumber)) {
                            return null;
                        }

                        node.parentNumber = parseInt(nodeContents[6]);

                        if (isNaN(node.parentNumber)) {
                            return null;
                        }

                        node.type = parseInt(nodeContents[1]);

                        if (isNaN(node.type)) {
                            return null;
                        }

                        node.x = parseFloat(nodeContents[2]);
                        node.y = parseFloat(nodeContents[3]);
                        node.z = parseFloat(nodeContents[4]);

                        node.radius = parseFloat(nodeContents[5]);

                        return node;
                    } catch (err) {
                        return null;
                    }
                }).filter(n => n !== null);

                if (nodes.length === 0) {
                    console.log("does not appear to be a valid swc file");
                    this.props.onFileIsInvalid();
                }

                const swcData: SwcData = new Map<number, SwcNodeData>();

                nodes.map(n => swcData.set(n.sampleNumber, n));

                this._sceneManager.removeAllNeurons();

                this._sceneManager.loadNeuron("sample", "#000000", swcData);

                const inputFile = new SwcInputFile();
                inputFile.file = file;
                inputFile.nodeCount = nodes.length;

                this.props.onFileLoaded(inputFile);
            }
        });

        reader.readAsText(file);
    }
}

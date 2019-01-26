import * as React from "react";
import {CSSProperties} from "react";
import {TextAlignProperty} from "csstype";

import {SceneManager, SwcData, SwcNodeData} from "../../three/sceneManager";

type FilePreviewProps = {
    style?: CSSProperties
    file: File;
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
        return (
            <div id="viewer-container" style={Object.assign({}, this.props.style || {}, {
                border: "1px solid lightgray",
                borderRadius: "4px"
            })}/>

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
            // Clear nodes
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
                        node.parentNumber = parseInt(nodeContents[6]);
                        node.type = parseInt(nodeContents[1]);
                        node.x = parseFloat(nodeContents[2]);
                        node.y = parseFloat(nodeContents[3]);
                        node.z = parseFloat(nodeContents[4]);
                        node.radius = parseFloat(nodeContents[5]);

                        return node;
                    } catch (err) {
                        return null;
                    }
                }).filter(n => n !== null);

                const swcData: SwcData = new Map<number, SwcNodeData>();

                nodes.map(n => swcData.set(n.sampleNumber, n));

                this._sceneManager.removeAll();

                this._sceneManager.loadNeuron("sample", "#000000", swcData);
            }
        });

        reader.readAsText(file);
    }
}

import * as React from "react";

import {Tracings} from "./components/Tracings";
import {CreateContainer} from "./components/create/CreateContainer";

interface IContentProps {
    shouldClearCreateContentsAfterUpload: boolean;
}

interface IContentState {
}

export class Content extends React.Component<IContentProps, IContentState> {
    public constructor(props: IContentProps) {
        super(props);
    }

    public render() {
        return (
            <div>
                <CreateContainer shouldClearCreateContentsAfterUpload={this.props.shouldClearCreateContentsAfterUpload}/>
                <Tracings/>
            </div>
        );
    }
}

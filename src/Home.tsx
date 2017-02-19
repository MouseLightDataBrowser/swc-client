import * as React from "react";
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Dropzone = require("react-dropzone");

const MyQuery = gql`query MyQuery { tracings { id filename } }`;

@graphql(MyQuery)
export class Home extends React.Component<any, any> {
    onDrop(acceptedFiles: string, rejectedFiles: string) {
        console.log('Accepted files: ', acceptedFiles);
        console.log('Rejected files: ', rejectedFiles);
    }

    render() {
        console.log(this.props.data);

        return (
            <Dropzone onDrop={this.onDrop}>
                <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
        );
    }
}

//export const HomeWithQuery = graphql(MyQuery)(Home);
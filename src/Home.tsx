import * as React from "react";
import {Button} from "react-bootstrap"
import {graphql} from 'react-apollo';
import gql from 'graphql-tag';

import Dropzone = require("react-dropzone");

const MyQuery = gql`query MyQuery { tracings { id filename } }`;

const UPLOAD_PROFILE_PICTURE = gql`
  mutation uploadSwc($annotator: String, $neuronId: String, $structureId: String, $files: [UploadedFile]) {
    uploadSwc(annotator: $annotator, neuronId: $neuronId, structureId: $structureId, files: $files)
  }`;


@graphql(MyQuery)
class HomePlain extends React.Component<any, any> {
    private files: any;

    onDrop(acceptedFiles: any, rejectedFiles: string) {
        console.log('Accepted files: ', acceptedFiles);
        this.files = acceptedFiles;
    }

    onClick(event: any) {
        if (this.files) {
            this.props.uploadSwc("Me", "000da450-edd5-4b27-887c-00aff659dd2c", "f00877c9-553e-46c6-831c-e8e3e297765d", this.files).then((data: any) => {
                console.log(`data: ${data}`);
                console.log(data);
            }).catch((err: any) => {
                console.log(`err: ${err}`);
            });
        }
    }

    render() {
        return (
            <div>
                <Dropzone
                    onDrop={(acceptedFiles: any, rejectedFiles: string) => this.onDrop(acceptedFiles, rejectedFiles)}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
                <Button onClick={(event) => this.onClick(event)}>Upload</Button>
            </div>
        );
    }
}


export const Home = graphql(UPLOAD_PROFILE_PICTURE, {
    props: ({ownProps, mutate}) => ({
        uploadSwc: (annotator: string, neuronId: string, structureId: string, files: any) => mutate({
            variables: {annotator, neuronId, structureId, files},
        }),
    }),
})(HomePlain);

import * as React from "react";
import {Pagination, FormGroup, FormControl} from "react-bootstrap";
const Slider = require("rc-slider").default;

export interface IPaginationHeaderProps {
    pageCount: number;
    activePage: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimitForPage(limit: number): void;
}

export interface IPaginationHeaderState {
    jumpPage?: number;
    limit?: number;
}

export class PaginationHeader extends React.Component<IPaginationHeaderProps, IPaginationHeaderState> {
    public constructor(props: IPaginationHeaderProps) {
        super(props);

        this.state = {
            jumpPage: 1,
            limit: 10
        }
    }

    private onPageTextChanged(evt: any) {
        this.setState({jumpPage: evt.target.value});
    }

    private onKeyPress(evt: any) {
        if (evt.charCode === 13) {
            const page = parseInt(evt.target.value);

            if (!isNaN(page) && page > 0 && page <= this.props.pageCount) {
                this.props.onUpdateOffsetForPage(page);
            }
        }
    }

    private get validationState(): any {
        return (this.state.jumpPage > 0 && this.state.jumpPage <= this.props.pageCount) ? null : "warning";
    }

    public componentWillReceiveProps(nextProps: IPaginationHeaderProps) {
        if (nextProps.activePage != this.props.activePage) {
            this.setState({jumpPage: nextProps.activePage});
        }
        this.setState({limit: nextProps.limit});
    }

    private renderGrid() {
        const paddingTop = this.props.pageCount > 1 ? "0px" : "24px";

        return (
            <div style={{
                padding: "0px",
                backgroundColor: "#fff",
                height: "71px",
                display: "inline-block"
            }}>
                <table >
                    <tbody>
                    <tr>
                        <td style={{
                            width: "400px",
                            paddingRight: "60px",
                            paddingLeft: "20px",
                            paddingTop: paddingTop,
                            paddingBottom: "10px"
                        }}>
                            <Slider min={10} max={50} step={5} value={this.state.limit}
                                           marks={{10: "10", 20: "20", 30: "30", 40: "40", 50: "50"}}
                                           onChange={(value: number) => this.setState({limit: value}, null)}
                                           onAfterChange={(value: number) => this.props.onUpdateLimitForPage(value)}/>
                        </td>
                        {this.renderPagination()}
                        {this.renderPageJump()}
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    private renderPageJump() {
        if (this.props.pageCount > 1) {
            return (
                <td>
                    <FormGroup bsSize="sm" validationState={this.validationState} style={{
                        display: "inline-block",
                        paddingTop: "20px",
                        marginLeft: "20px",
                        width: "80px"
                    }}>
                        <FormControl type="text"
                                     value={this.state.jumpPage}
                                     onKeyPress={(evt: any) => this.onKeyPress(evt)}
                                     onChange={(evt: any) => this.onPageTextChanged(evt)}/>
                    </FormGroup>
                </td>
            );
        } else {
            return null;
        }
    }

    private renderPagination() {
        if (this.props.pageCount > 1) {
            return (
                <td style={{paddingTop: "5px"}}>
                    <Pagination prev next ellipsis boundaryLinks bsSize="medium"
                                style={{display: "inline"}}
                                first={this.props.pageCount > 2}
                                last={this.props.pageCount > 2}
                                maxButtons={10}
                                items={this.props.pageCount}
                                activePage={this.props.activePage}
                                onSelect={(page: any) => {
                                    this.props.onUpdateOffsetForPage(page)
                                }}/>
                </td>
            );
        } else {
            return null;
        }
    }

    public render() {
        return this.renderGrid();
    }
}

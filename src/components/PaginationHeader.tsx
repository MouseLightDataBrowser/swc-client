import * as React from "react";
import {Pagination, FormControl, InputGroup} from "react-bootstrap";
import * as RcSliderClass from "rc-slider";

interface IPaginationHeaderProps {
    pageCount: number;
    activePage: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimitForPage(limit: number): void;
}

interface IPaginationHeaderState {
    pageTextValue?: string;
    limit?: number;
}

export class PaginationHeader extends React.Component<IPaginationHeaderProps, IPaginationHeaderState> {
    public constructor(props: IPaginationHeaderProps) {
        super(props);

        this.state = {
            pageTextValue: "",
            limit: 10
        }
    }

    private onPageTextChanged(evt: any) {
        this.setState({pageTextValue: evt.target.value});
    }

    private onKeyPress(evt: any) {
        if (evt.charCode === 13) {
            const page = parseInt(this.state.pageTextValue);

            if (!isNaN(page) && page > 0 && page <= this.props.pageCount) {
                this.props.onUpdateOffsetForPage(page);
            }
        }
    }

    public componentWillReceiveProps(nextProps: IPaginationHeaderProps) {
        if (nextProps.activePage != this.props.activePage) {
            this.setState({pageTextValue: nextProps.activePage.toString()});
        }
        this.setState({limit: nextProps.limit});
    }

    private renderGrid() {
        const paddingTop= this.props.pageCount > 1 ? "0px" : "12px";

        return (
            <div style={{
                padding: "4px",
                backgroundColor: "#fff",
                borderBottom: "1px solid #ddd",
                height: "71px"
            }}>
                <table >
                    <tbody>
                    <tr>
                        <td style={{width: "400px", paddingRight: "60px", paddingLeft: "20px", paddingTop: paddingTop, paddingBottom: "10px"}}>
                            <RcSliderClass min={10} max={50} step={5} value={this.state.limit}
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
                    <InputGroup>
                        <FormControl type="text" style={{
                            display: "inline",
                            marginTop: "15px",
                            marginLeft: "8px",
                            maxWidth: "80px"
                        }}
                                     value={this.state.pageTextValue}
                                     onKeyPress={(evt: any) => this.onKeyPress(evt)}
                                     onChange={(evt: any) => this.onPageTextChanged(evt)}/>
                    </InputGroup>
                </td>
            );
        } else {
            return null;
        }
    }

    private renderPagination() {
        if (this.props.pageCount > 1) {
            return (
                <td style={{paddingTop: "14px"}}>
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

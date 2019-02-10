import {
    Component,
    OnInit,
    ViewEncapsulation,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';

// import * as d3 from 'd3';
import { groupBy } from 'lodash';

declare let d3: any;

export interface PieChartData {
    blacklistClass: string;
    blacklistClassPct: number;
}

export interface CalenderData {
    queryName: string;
    threatDeltaYesterday: number;
    ceatedon: string;
    tsToday: number;
}

export interface GroupedChartData {
    avg: number;
    createdOn: string;
    queryName: string;
}

@Component({
    selector: 'app-trends',
    templateUrl: './trends.component.html',
    styleUrls: ['./trends.component.css', '../../../node_modules/nvd3/build/nv.d3.css'],
    encapsulation: ViewEncapsulation.None
})
export class TrendsComponent implements OnInit {
    top10IPsbyThreatColumns: string[] = ['ipaddress', 'threat_potential_score_pct', 'blacklist_class'];
    ipHotListColumns: string[] = ['ipAddress', 'severityScore', 'blacklistClass'];
    isLoading;

    watchlistbyThreatlevel;
    top10IPsbyThreat;
    threatTypeBreakdown: PieChartData[];
    threatScoreVolatility;
    watchlistTrends;

    pieChartOptions;

    barChartOptions;
    barChartOptions1;

    // IP Hot List - All IPs by Risk Severity table pagination
    ipHotListData;
    itemsLength;
    pageIndex;
    pageSize = 50;
    pageSizeOptions: number[] = [25, 50, 100, 200];
    ipHotListTableData = new MatTableDataSource([]);

    @ViewChild('paginator') paginator: MatPaginator;

    private sort: MatSort;
    @ViewChild(MatSort) set matSort(ms: MatSort) {
        this.sort = ms;
        this.setDataSourceAttributes();
    }

    constructor(
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.ipHotListTableData.sort = this.sort;
        this.route.data.subscribe(routeData => {
            const data = routeData['data'].trendsData;
            if (data) {
                // bar chart
                this.watchlistbyThreatlevel = [{
                    key: '',
                    values: [...data.watchlistbyThreatlevel]
                }];
                // table
                this.top10IPsbyThreat = data.top10IPsbyThreat;
                // pie chart
                this.threatTypeBreakdown = groupBy(data.threatTypeBreakdown, 'queryName');
                // heatmap
                this.threatScoreVolatility = data.threatScoreVolatility.map(item => ({
                    date: new Date(item.createdon.value),
                    value: item.tsToday,
                    name: item.queryname,
                }));

                this.ipHotListData = data.ipHotList;
                this.itemsLength = data.ipHotList.length;
                this.ipHotListTableData.data = data.ipHotList.slice(0, this.pageSize);

                // heatmap
                this.watchlistTrends = [{
                    key: '',
                    values: [...data.watchlistTrends]
                }];
            }
        });

        this.pieChartOptions = {
            'chart': {
                type: 'pieChart',
                x: (d) => d.blacklistClass,
                y: (d) => d.blacklistClassPct,
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                showLegend: false,
            }
        };

        this.barChartOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: (d) => d.queryName,
                y: (d) => d.avg_threat_score,
                showValues: true,
                valueFormat: (d) => d3.format(',.2f')(d),
                duration: 500,
                yAxis: {
                    axisLabel: 'Average Threat Score',
                },
                barColor: (d, i) => {
                    const color = d3.scale.linear().domain([1, 10])
                        .interpolate(d3.interpolateHcl)
                        .range([d3.rgb('#DC3545'), d3.rgb('#28A745')]);
                    return color(i);
                },
                showLegend: false,
                showControls: false,
            }
        };

        this.barChartOptions1 = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: (d) => d.queryName,
                y: (d) => d.avg,
                showValues: true,
                valueFormat: (d) => d3.format(',.2f')(d),
                duration: 500,
                yAxis: {
                    axisLabel: 'Average Threat Score',
                },
                barColor: (d, i) => {
                    const color = d3.scale.linear().domain([1, 10])
                        .interpolate(d3.interpolateHcl)
                        .range([d3.rgb('#DC3545'), d3.rgb('#28A745')]);
                    return color(i);
                },
                showLegend: false,
                showControls: false,
            }
        };

        this.ipHotListTableData.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
            if (typeof data[sortHeaderId] === 'string') {
                return data[sortHeaderId].toLocaleLowerCase();
            }
            return data[sortHeaderId];
        };
    }

    setDataSourceAttributes() {
        this.ipHotListTableData.sort = this.sort;
    }

    getPageInfo(e) {
        this.pageSize = e.pageSize;
        this.ipHotListTableData.data = this.ipHotListData.slice(
            e.pageIndex * (this.pageSize - 1),
            e.pageIndex * (this.pageSize - 1) + this.pageSize,
        );
    }
}

// TODO heatmap component module - need to be updated
// @Component({
//     selector: 'app-heatmap-chart',
//     template: '<div #heatmapChart></div>',
//     styleUrls: ['./trends.component.css']
// })

// export class HeatmapChartComponent implements OnInit {
//     @ViewChild('heatmapChart') element: ElementRef;
//     private margin;
//     private width;
//     private height;
//     private gridSize;
//     private legendElementWidth;
//     private buckets;
//     private colors;
//     private days;
//     private times;
//     private svg;
//     private data;

//     ngOnInit() {
//         this.data = [];
//         this.createChart();
//     }

//     createChart() {
//         const element = this.element.nativeElement;

//         this.margin = { top: 50, right: 0, bottom: 100, left: 30 };
//         this.width = 960 - this.margin.left - this.margin.right;
//         this.height = 430 - this.margin.top - this.margin.bottom;
//         this.gridSize = Math.floor(this.width / 24);
//         this.legendElementWidth = this.gridSize * 2;
//         this.buckets = 9;
//         this.colors = ['#dc3545', '#28a745']; // alternatively colorbrewer.YlGnBu[9]
//         this.days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
//         this.times = [];

//         this.svg = d3.select(element).append('svg')
//             .attr('width', this.width + this.margin.left + this.margin.right)
//             .attr('height', this.height + this.margin.top + this.margin.bottom)
//             .append('g')
//             .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

//         const dayLabels = this.svg.selectAll('.dayLabel')
//           .data(this.days)
//           .enter().append('text')
//             .text((d) => d)
//             .attr('x', 0)
//             .attr('y', (d, i) => i * this.gridSize)
//             .style('text-anchor', 'end')
//             .attr('transform', 'translate(-6,' + this.gridSize / 1.5 + ')')
//             .attr('class', (d, i) => ((i >= 0 && i <= 4) ? 'dayLabel mono axis axis-workweek' : 'dayLabel mono axis'));

//         const timeLabels = this.svg.selectAll('.timeLabel')
//           .data(this.times)
//           .enter().append('text')
//             .text((d) => d)
//             .attr('x', (d, i) => i * this.gridSize)
//             .attr('y', 0)
//             .style('text-anchor', 'middle')
//             .attr('transform', 'translate(' + this.gridSize / 2 + ', -6)')
//             .attr('class', (d, i) => ((i >= 7 && i <= 16) ? 'timeLabel mono axis axis-worktime' : 'timeLabel mono axis'));
//         this.heatmapChart();
//     }

//     heatmapChart() {
//         const colorScale = d3.scale.quantile()
//             .domain([0, this.buckets - 1, d3.max(this.data, function (d) { return d.value; })])
//             .range(this.colors);
//         const cards = this.svg.selectAll('.hour')
//             .data(this.data, (d) => d.day + ':' + d.hour);

//         cards.append('title');
//         cards.enter().append('rect')
//             .attr('x', (d) => (d.hour - 1) * this.gridSize)
//             .attr('y', (d) => (d.day - 1) * this.gridSize)
//             .attr('rx', 4)
//             .attr('ry', 4)
//             .attr('class', 'hour bordered')
//             .attr('width', this.gridSize)
//             .attr('height', this.gridSize)
//             .style('fill', this.colors[0]);
//         cards.transition().duration(1000)
//             .style('fill', (d) => colorScale(d.value));
//         cards.select('title').text((d) => d.value);

//         cards.exit().remove();

//         const legend = this.svg.selectAll('.legend')
//             .data([0].concat(colorScale.quantiles()), (d) => d);

//         legend.enter().append('g')
//             .attr('class', 'legend');

//         legend.append('rect')
//             .attr('x', (d, i) => this.legendElementWidth * i)
//             .attr('y', this.height)
//             .attr('width', this.legendElementWidth)
//             .attr('height', this.gridSize / 2)
//             .style('fill', (d, i) => this.colors[i]);

//         legend.append('text')
//             .attr('class', 'mono')
//             .text((d) => '≥ ' + Math.round(d))
//             .attr('x', (d, i) => this.legendElementWidth * i)
//             .attr('y', this.height + this.gridSize);

//         legend.exit().remove();
//     }
// }

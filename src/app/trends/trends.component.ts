import {
    Component,
    OnInit,
    OnChanges,
    ViewEncapsulation,
    ElementRef,
    ViewChild,
    Input,
    AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort, MatTableDataSource } from '@angular/material';

import * as d3 from 'd3';
import { groupBy } from 'lodash';
import * as moment from 'moment';

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

@Component({
    selector: 'app-trends',
    templateUrl: './trends.component.html',
    styleUrls: ['./trends.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class TrendsComponent implements OnInit {

    top10IPsbyThreatColumns: string[] = ['ipaddress', 'threat_potential_score_pct', 'blacklist_class'];
    ipHotListColumns: string[] = ['ipAddress', 'severityScore', 'blacklistClass'];
    isLoading;

    watchlistsByThreatlevel;
    top10IPsbyThreat;
    threatTypeBreakdown: PieChartData[];
    threatScoreVolatility;
    ipHotList = new MatTableDataSource([]);

    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.ipHotList.sort = this.sort;
        this.route.data.subscribe(routeData => {
            const data = routeData['data'].trendsData;
            if (data) {
                this.watchlistsByThreatlevel = data.watchlistbyThreatlevel.map(item => [item.queryName, item.avg_threat_score]);
                this.top10IPsbyThreat = data.top10IPsbyThreat;
                this.threatTypeBreakdown = groupBy(data.threatTypeBreakdown, 'queryName');
                this.threatScoreVolatility = data.threatScoreVolatility.map(item => ({
                    date: new Date(item.createdon.value),
                    value: item.tsToday,
                    name: item.queryname,
                }));
                this.ipHotList.data = data.ipHotList;
            }
        });
    }
}

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./trends.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class BarChartComponent implements OnInit, OnChanges {
    @ViewChild('chart') private chartContainer: ElementRef;
    @Input() private data: Array<any>;
    private margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
    private chart: any;
    private width: number;
    private height: number;
    private xScale: any;
    private yScale: any;
    private colors: any;
    private xAxis: any;
    private yAxis: any;
    constructor() { }
    ngOnInit() {
        this.createChart();
        if (this.data) {
            this.updateChart();
        }
    }
    ngOnChanges() {
        if (this.chart) {
            this.updateChart();
        }
    }

    createChart() {
        const element = this.chartContainer.nativeElement;
        this.width = element.offsetWidth - this.margin.left - this.margin.right;
        this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
        const svg = d3.select(element).append('svg').attr('width', element.offsetWidth).attr('height', element.offsetHeight);

        // chart plot area
        this.chart = svg.append('g')
            .attr('class', 'bars')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // define X & Y domains
        const xDomain = this.data.map(d => d[0]);
        const yDomain = [0, d3.max(this.data, d => d[1])];

        // create scales
        this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width]);
        this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

        // bar colors
        this.colors = d3.scaleLinear().domain([0, this.data.length]).range(<any[]>['#DC3445', '#27A745']);

        // x & y axis
        this.xAxis = svg.append('g')
            .attr('class', 'axis axis-x')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale));
        this.yAxis = svg.append('g')
            .attr('class', 'axis axis-y')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));
    }

    updateChart() {
        // update scales & axis
        this.xScale.domain(this.data.map(d => d[0]));
        this.yScale.domain([0, d3.max(this.data, d => d[1])]);
        this.colors.domain([0, this.data.length]);
        this.xAxis.transition().call(d3.axisBottom(this.xScale));
        this.yAxis.transition().call(d3.axisLeft(this.yScale));
        const update = this.chart.selectAll('.bar').data(this.data);

        // remove exiting bars
        update.exit().remove();

        // update existing bars
        this.chart.selectAll('.bar').transition()
            .attr('x', d => this.xScale(d[0]))
            .attr('y', d => this.yScale(d[1]))
            .attr('width', d => this.xScale.bandwidth())
            .attr('height', d => this.height - this.yScale(d[1]))
            .style('fill', (d, i) => this.colors(i));

        // add new bars
        update
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => this.xScale(d[0]))
            .attr('y', d => this.yScale(0))
            .attr('width', this.xScale.bandwidth())
            .attr('height', 0)
            .style('fill', (d, i) => this.colors(i))
            .transition()
            .delay((d, i) => i * 10)
            .attr('y', d => this.yScale(d[1]))
            .attr('height', d => this.height - this.yScale(d[1]));
    }

}

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html'
})

export class PieChartComponent implements AfterViewInit {
    @ViewChild('containerPieChart') element: ElementRef;
    private host;
    private svg;
    private width: number;
    private height: number;
    private radius: number;
    private htmlElement: HTMLElement;

    @Input() private pieData: PieChartData[];

    ngAfterViewInit() {
        this.htmlElement = this.element.nativeElement;
        this.host = d3.select(this.htmlElement);
        this.setup();
        this.buildSVG();
        this.buildPie();
    }

    private setup(): void {
        this.width = 300;
        this.height = 300;
        this.radius = Math.min(this.width, this.height) / 2;
    }

    private buildSVG(): void {
        this.host.html('');
        this.svg = this.host.append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .append('g')
            .attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    }

    private buildPie(): void {
        const pie = d3.pie();
        const values = this.pieData.map(data => data.blacklistClassPct);
        const arcSelection = this.svg.selectAll('.arc')
            .data(pie(values))
            .enter()
            .append('g')
            .attr('class', 'arc');

        this.populatePie(arcSelection);
    }

    private populatePie(arcSelection): void {
        const innerRadius = this.radius - 50;
        const outerRadius = this.radius - 10;
        const pieColor = d3.scaleOrdinal(d3.schemeCategory10);
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(outerRadius);
        arcSelection.append('path')
            .attr('d', arc)
            .attr('fill', (datum, index) => {
                return pieColor(this.pieData[index].blacklistClass);
            });

        arcSelection.append('text')
            .attr('transform', (datum: any) => {
                datum.innerRadius = 0;
                datum.outerRadius = outerRadius;
                return 'translate(' + arc.centroid(datum) + ')';
            })
            .text((datum, index) => this.pieData[index].blacklistClass)
            .style('text-anchor', 'middle');
    }
}
@Component({
    selector: 'app-calender-chart',
    template: '<div #containerCalenderChart></div>',
    styleUrls: ['./trends.component.css'],
})

export class CalenderChartComponent implements AfterViewInit {
    @ViewChild('containerCalenderChart') element: ElementRef;
    private host;
    private svg;
    private width: number;
    private height: number;
    private cellSize = 17;
    private timeWeek;
    private countDay;
    private format;
    private formatDate;
    private formatDay;
    private formatMonth;
    private color;
    private htmlElement: HTMLElement;

    @Input() private calenderData: CalenderData[];

    ngAfterViewInit() {
        this.htmlElement = this.element.nativeElement;
        this.host = d3.select(this.htmlElement);
        this.setup();
        this.buildSVG();
        this.buildCalender();
    }

    private setup(): void {
        this.width = 900;
        this.height = this.cellSize * 9;
        this.timeWeek = d3.timeSunday;
        this.format = d3.format('.2f');
        this.formatDate = d3.timeFormat('%x');
        this.formatDay = d => 'SMTWTFS'[d.getDay()];
        this.formatMonth = d3.timeFormat('%b');
        this.color = d3.scaleOrdinal().domain(['0', '100']).range(['#28a745', '#f9c108', '#dc3545']);
        this.countDay = d => d.getDay();
    }

    pathMonth(t) {
        const n = 7;
        const d = Math.max(0, Math.min(n, this.countDay(t)));
        const w = this.timeWeek.count(d3.timeYear(t), t);
        return `${d === 0 ? `M${w * this.cellSize},0`
            : d === n ? `M${(w + 1) * this.cellSize},0`
                : `M${(w + 1) * this.cellSize},0V${d * this.cellSize}H${w * this.cellSize}`}V${n * this.cellSize}`;
    }

    private buildSVG(): void {
        this.host.html('');
        this.svg = this.host.append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    private buildCalender(): void {
        const years = d3.nest()
            .key((d: any) => d.date.getFullYear())
            .entries(this.calenderData)
            .reverse();

        const year = this.svg.selectAll('g')
            .data(years)
            .enter().append('g')
            .attr('transform', (d, i) => `translate(40,${this.height * i + this.cellSize * 1.5})`);

        year.append('text')
            .attr('x', -5)
            .attr('y', -5)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'end')
            .text(d => d.key);

        year.append('g')
            .attr('text-anchor', 'end')
            .selectAll('text')
            .data((d3.range(7)).map(i => new Date(1995, 0, i)))
            .enter().append('text')
            .attr('x', -5)
            .attr('y', d => (this.countDay(d) + 0.5) * this.cellSize)
            .attr('dy', '0.31em')
            .text(this.formatDay);

        year.append('g')
            .selectAll('rect')
            .data(d => d.values)
            .enter().append('rect')
            .attr('width', this.cellSize - 1)
            .attr('height', this.cellSize - 1)
            .attr('x', (d: any) => this.timeWeek.count(d3.timeYear(d.date), d.date) * this.cellSize + 0.5)
            .attr('y', (d: any) => this.countDay(d.date) * this.cellSize + 0.5)
            .attr('fill', (d: any) => this.color(d.value))
            .append('title')
            .text((d: any) => `${this.formatDate(d.date)}: ${this.format(d.value)}`);

        const month = year.append('g')
            .selectAll('g')
            .data(d => d3.timeMonths(d3.timeMonth(d.values[0].date), d.values[d.values.length - 1].date))
            .enter().append('g');

        month.filter((d, i: any) => i).append('path')
            .attr('fill', 'none')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('d', this.pathMonth);

        month.append('text')
            .attr('x', (d: any) => this.timeWeek.count(d3.timeYear(d), this.timeWeek.ceil(d)) * this.cellSize + 2)
            .attr('y', -5)
            .text(this.formatMonth);
    }
}

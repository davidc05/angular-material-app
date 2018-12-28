import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatGridList, MatChipInputEvent, MatAutocompleteSelectedEvent, MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';
import { TagsService } from '../services/tags.service';
import { FormControl, Validators } from '@angular/forms';
import { map, startWith, switchMap, debounceTime } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { UserService } from '../services/user.service';
import { NoteService } from '../services/note.service';
import * as moment from 'moment';

export interface EditNoteDialogData {
    dialogName: string;
    userNote: any;
}

export interface IpDetail {
    ipaddress: string,
    ipint: number,
    threat_potential_score_pct: number,
    threat_classification: string,
    blacklist_class: string,
    blacklist_class_cnt: number,
    blacklist_network_neighbor_cnt: number,
    blacklist_observations: number,
    country: string,
    stateprov: string,
    district: string,
    city: string,
    zipcode: string,
    timezone_offset: number,
    timezone_name: string,
    ispname: string,
    network_type: string,
    network_group: string,
    network_name: string
}

@Component({
    selector: 'app-ip-detail',
    templateUrl: './ip-detail.component.html',
    styleUrls: ['./ip-detail.component.css']
})
export class IpDetailComponent implements OnInit {

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _location: Location,
        private observableMedia: ObservableMedia,
        private tagsService: TagsService,
        private userService: UserService,
        private noteService: NoteService,
        public dialog: MatDialog,
    ) { }

    tagsFormControl = new FormControl();
    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
    user;
    subscriptionPlan;
    last;
    ipDetail: IpDetail;
    fieldNames = {
        ipaddress: "IP Address",
        ipint: "IP Integer Representation",
        threat_potential_score_pct: "Threat Score",
        threat_classification: "Threat Classification",
        blacklist_class: "Blacklist Class",
        blacklist_class_cnt: "Blacklist Count",
        blacklist_network_neighbor_cnt: "Blacklist Network Neighbors",
        blacklist_observations: "Blacklist Observations",
        country: "Country",
        stateprov: "State/Province",
        district: "District",
        city: "City",
        zipcode: "Zip Code",
        timezone_offset: "Timezone Offset",
        timezone_name: "Timezone",
        ispname: "ISP Name",
        network_type: "Network Type",
        network_group: "Network Group",
        network_name: "Network Name"
    }

    ipThreatDetail;
    ipThreatDetailFields = [
        "threat_potential_score_pct",
        "threat_classification",
        "blacklist_class",
        "blacklist_class_cnt",
        "blacklist_network_neighbor_cnt",
        "blacklist_observations"
    ];

    ipGeoDetail;
    ipGeoDetailFields = [
        "country",
        "stateprov",
        "district",
        "city",
        "zipcode",
        "timezone_offset",
        "timezone_name"
    ];
    latitude;
    longitude;
    iconUrl = {
        url: '../../assets/markers/green.svg',
        scaledSize: {
            width: 40,
            height: 40
        }
    };
    ipISPDetail;
    ipISPDetailFields = [
        "ispname",
        "network_type",
        "network_group",
        "network_name"
    ];

    circleTitle;
    circleSubtitle;
    circleRiskLevel;
    circleBackgroundColor;
    circleOuterStrokeColor;
    circleRadius;

    userNote: string = '';
    userNotesList = {};

    setCircleData() {
        this.circleRadius = 100;
        switch (this.ipDetail.threat_classification) {
            case "High":
                this.circleTitle = ['High', 'Risk', ''];
                this.circleSubtitle = this.ipDetail.ipaddress;
                this.circleRiskLevel = this.ipDetail.threat_classification;
                this.circleBackgroundColor = '#FDC6CB';
                this.circleOuterStrokeColor = '#dc3545';
                this.iconUrl.url = '../../assets/markers/red.svg';
                break;
            case "Medium":
                this.circleTitle = ['Medium', 'Risk', ''];
                this.circleSubtitle = this.ipDetail.ipaddress;
                this.circleRiskLevel = this.ipDetail.threat_classification;
                this.circleBackgroundColor = '#FFE9A9';
                this.circleOuterStrokeColor = '#ffc107';
                this.iconUrl.url = '../../assets/markers/yellow.svg';
                break;
            case "Low":
                this.circleTitle = ['Low', 'Risk', ''];
                this.circleSubtitle = this.ipDetail.ipaddress;
                this.circleRiskLevel = this.ipDetail.threat_classification;
                this.circleBackgroundColor = '#B8ECC3';
                this.circleOuterStrokeColor = '#28a745';
                this.iconUrl.url = '../../assets/markers/green.svg';
                break;
            default:
                this.circleTitle = [];
                this.circleSubtitle = this.ipDetail.ipaddress;
                this.circleRiskLevel = this.ipDetail.threat_classification;
                this.circleBackgroundColor = '#e0e0e0';
                this.circleOuterStrokeColor = '#686868';
        }
    }

    //Chip input properties for tags section
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    tagsFull;
    tags;
    tagsLimit;
    tagsSuggestions;
    options: string[] = ['One', 'Two', 'Three'];
    filteredOptions: Observable<string[]>;


    ngOnInit() {
        this.ipThreatDetail = {};
        this.ipGeoDetail = {};
        this.ipISPDetail = {};
        this.tagsLimit = 100;
        this.tags = [];
        this.latitude = 0;
        this.longitude = 0;
        this.subscriptionPlan = this.userService.user.subscriptionPlan;
        this.route.data.subscribe(routeData => {
            let data = routeData['data'];
            if (data) {
                this.ipDetail = data;
                if (!this.ipDetail.zipcode || this.ipDetail.zipcode === '') {
                    this.ipDetail.zipcode = "N/A"
                }
                //Set circle data
                this.setCircleData();
                this.ipThreatDetailFields.forEach(key => {
                    this.ipThreatDetail[key] = data[key];
                });
                this.ipGeoDetailFields.forEach(key => {
                    this.ipGeoDetail[key] = data[key];
                    this.latitude = data['latitude'];
                    this.longitude = data['longitude'];
                });
                this.ipISPDetailFields.forEach(key => {
                    this.ipISPDetail[key] = data[key];
                });
                this.getIpTags();
            }
        })

        this.getIPsNotes();

        //Automcomplete
        // this.filteredOptions = this.tagsFormControl.valueChanges
        //   .pipe(
        //     startWith(''),
        //     map(value => this._filter(value))
        //   );

        this.tagsSuggestions = new Observable<string[]>();
        this.tagsSuggestions = this.tagsFormControl
            .valueChanges
            .pipe(
                debounceTime(300),
                switchMap(tag => {
                    return this.tagsService.findUserTagByName(this.userService.user.email, tag, this.tags);
                })
            )

        window.scrollTo(0, 0);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }

    displayFn(tag) {
        if (tag) { return tag.name; }
    }

    getIpTags() {
        this.tagsService.getUserTagsByIp(this.ipDetail.ipaddress, this.userService.user.email).toPromise().then(
            result => {
                this.tagsFull = result;
                this.tags = result.map(val => {
                    return val.name;
                });
            },
            err => {

            }
        );
    }

    //Value selected on Autocomplete
    selected(event: MatAutocompleteSelectedEvent): void {
        this.validateAndAddTag(event.option.viewValue);
        this.tagInput.nativeElement.value = '';
        this.tagsFormControl.setValue(null);
    }

    //Adds chips to the textbox
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our tag
        this.validateAndAddTag(value);
        // Reset the input value
        this.tagInput.nativeElement.value = '';
        this.tagsFormControl.setValue(null);
    }

    validateAndAddTag(value) {
        if ((value || '').trim()) {
            if (this.tags.length < this.tagsLimit) {
                var trimmedValue = value.trim()
                if (!this.tags.includes(trimmedValue)) {
                    this.tagsService.getUserTagByName(trimmedValue, this.userService.user.email).toPromise().then(
                        result => {
                            if (result.length === 0) {
                                //create
                                this.tagsService.createTag(trimmedValue, this.userService.user.email, [this.ipDetail.ipaddress]).then(
                                    result => {
                                        this.getIpTags();
                                    },
                                    err => {

                                    }
                                )
                            }
                            else {
                                let tag = result[0];
                                if (tag.ips.indexOf(trimmedValue) < 0) {
                                    //update
                                    tag.ips.push(this.ipDetail.ipaddress);
                                    this.tagsService.updateTag(tag).then(
                                        result => {
                                            this.getIpTags();
                                        },
                                        err => {


                                        }
                                    );
                                }
                            }
                        },
                        err => {

                        }
                    )
                }
            }
        }
    }

    //Removes chips to the textbox
    remove(tagName): void {
        const index = this.tags.indexOf(tagName);
        if (index >= 0) {
            var tag = this.tagsFull.find(aTag => aTag.name === tagName);
            let ipIndex = tag.ips.indexOf(this.ipDetail.ipaddress);
            tag.ips.splice(ipIndex, 1);
            this.tagsService.updateTag(tag).then(
                result => {
                    this.tags.splice(index, 1);
                },
                err => {

                }
            )
        }
    }

    //Handles paste event for chips addition
    paste(event: ClipboardEvent): void {
        event.preventDefault();
        event.clipboardData
            .getData('Text')
            .split(/,|\n/)
            .forEach(value => {
                if ((value || '').trim()) {
                    if (this.tags.length < this.tagsLimit) {
                        var trimmedValue = value.trim()
                        if (!this.tags.includes(trimmedValue)) {
                            this.tags.push(value.trim());
                        }
                    }
                }
            })
    }

    onClickBuyApp() {
        window.open("https://musubu.io/app-pricing/", "_blank");
    }

    isArray(value) {
        return Array.isArray(value);
    }

    convertToSet(array) {
        return new Set(array);
    }

    getKeys(map) {
        return Object.keys(map);
    }

    backButton() {
        this._location.back();
    }

    groupByDate(notes: any) {
        let dates = {};
        for (let i = 0; i < notes.length; i += 1) {
            let obj = notes[i];
            let date = moment(obj.date).format('MMMM DD, YYYY');
            if (dates[date]) {
                dates[date].push(obj);
            } else {
                dates[date] = [obj];
            }
        }

        return Object.values(dates);
    }

    getIPsNotes() {
        this.noteService.getUserNotesByIp(this.ipDetail.ipaddress).toPromise().then(res => {
            this.userNotesList = this.groupByDate(res.map(item => ({
                ...item,
                date: moment(item.createdOn).format('MMMM DD, YYYY'),
                time: moment(item.createdOn).format('h:mm A')
            })).reverse());
        });
    }

    createEditNoteDialog(userNote, dialogName, type) {
        const dialogRef = this.dialog.open(EditNoteDialog, {
            width: '300px',
            data: {
                dialogName: dialogName,
                userNote: {
                    ...userNote,
                    text: userNote.text ? userNote.text : '',
                },
            }
        });

        dialogRef.keydownEvents().subscribe(result => {
            if (result.key === "Enter") {
                dialogRef.componentInstance.closeDialog();
            }
        }, err => {

        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (type === 'create') {
                    this.user = JSON.parse(localStorage.getItem('profile'));
                    this.noteService.createNote(
                        result.userNote.text,
                        this.user.email,
                        this.user.name,
                        this.user.picture,
                        this.ipDetail.ipaddress
                    ).then(
                        () => {
                            this.getIPsNotes();
                        },
                        err => {

                        }
                    );
                }
                if (type === "update") {
                    this.noteService.updateNote(result.userNote).then(
                        result => {
                            this.getIPsNotes();
                        },
                        err => {

                        }
                    )
                }
            }
        });
    }

    createNoteDeleteDialog(id) {
        const dialogRef = this.dialog.open(DeleteNoteDialog, { width: '300px' });

        dialogRef.keydownEvents().subscribe(result => {
            if (result.key === "Enter") {
                dialogRef.componentInstance.closeDialog(false);
            }
        }, err => {

        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.noteService.deleteNote(id).then(
                    result => {
                        this.getIPsNotes();
                    },
                    err => {

                    }
                );
            }
        });
    }
}

@Component({
    selector: 'edit-note-dialog',
    templateUrl: 'edit-note-dialog.html',
    styleUrls: ['ip-detail.component.css']
})

export class EditNoteDialog implements OnInit {
    userNoteInput = new FormControl(this.data.userNote.text,
        {
            updateOn: 'change',
            validators: [Validators.required],
        }
    );
    constructor(
        public dialogRef: MatDialogRef<EditNoteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: EditNoteDialogData,
    ) { }

    ngOnInit() {
    }

    getNameErrorMessage() {
        if (this.userNoteInput.hasError('required')) {
            return 'You must enter a value.';
        }
        return '';
    }

    closeDialog() {
        if (!this.userNoteInput.invalid) {
            this.data.userNote.text = this.userNoteInput.value;
            this.dialogRef.close(this.data);
        }
        else {
            this.userNoteInput.markAsTouched();
            this.getNameErrorMessage();
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}


@Component({
    selector: 'delete-note-dialog',
    templateUrl: 'delete-note-dialog.html',
    styleUrls: ['ip-detail.component.css']
})
export class DeleteNoteDialog {
    constructor(
        public dialogRef: MatDialogRef<DeleteNoteDialog>,
    ) { }

    ngOnInit() {
    }

    closeDialog(value) {
        this.dialogRef.close(value);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}


